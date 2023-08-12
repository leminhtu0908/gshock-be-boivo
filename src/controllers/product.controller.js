/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
const httpStatus = require("http-status");
const Product = require("../models/product.model");
const DanhMuc = require("../models/danhmuc.model");
const Color = require("../models/color.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const { STATUS } = require("../constants/commons");
const { isValidObjectId, Types } = require("mongoose");

const ProductController = {
  listPaginate: async (req, res, next) => {
    try {
      const perPage = parseInt(req.query.per_page, 10) || 10; // Number of items per page
      const currentPage = parseInt(req.query.current_page, 10) || 1; // Current page number
      const searchTerm = req.query.name || ""; // Search term
      const filter = {
        name: { $regex: searchTerm, $options: "i" },
      };
      const totalCount = await Product.countDocuments(filter); // Total count of matching documents
      const totalPages = Math.ceil(totalCount / perPage); // Total number of pages
      const skipCount = perPage * (currentPage - 1); // Number of documents to skip

      const product = await Product.find(filter)
        .populate([
          {
            path: "categoryId",
            select: "-products",
          },
          {
            path: "colors",
            select: "-products",
          },
        ])
        .sort({ createdAt: -1 })
        .skip(skipCount)
        .limit(perPage)
        .exec();

      res.send({
        content: product,
        size: perPage,
        totalElements: totalCount,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },

  getAllProduct: async (req, res, next) => {
    try {
      const name = req.query.name || "";
      const tenDanhMuc = req.query.tenDanhMuc || "";
      const colors = req.query.colors ? req.query.colors.split(",") : []; // Màu sắc được truyền dưới dạng chuỗi, ví dụ: 'red,blue,green'
      const priceIn = req.query.price_in ? parseInt(req.query.price_in) : null; // Giá nhỏ nhất
      const priceTo = req.query.price_to ? parseInt(req.query.price_to) : null;
      const filter = {
        name: { $regex: name, $options: "i" },
      };
      if (tenDanhMuc) {
        const danhMuc = await DanhMuc.findOne({
          name: { $regex: tenDanhMuc, $options: "i" },
        });
        if (danhMuc) {
          filter["categoryId"] = danhMuc._id;
        }
      }
      if (colors.length > 0) {
        const colorIds = await Color.find({ name: { $in: colors } }).distinct(
          "_id"
        );
        filter["colors"] = { $in: colorIds };
      }
      if (priceIn !== null && priceTo !== null) {
        filter["price"] = { $gte: priceIn, $lte: priceTo };
      } else if (priceIn !== null) {
        filter["price"] = { $gte: priceIn };
      } else if (priceTo !== null) {
        filter["price"] = { $lte: priceTo };
      }
      const sort = req.query.sortPrice;
      let sortOption = {};
      if (sort === "asc") {
        sortOption = { price: 1 };
      } else if (sort === "desc") {
        sortOption = { price: -1 };
      } else {
        sortOption = { createdAt: -1 };
      }
      const product = await Product.find(filter)
        .populate([
          {
            path: "categoryId",
            select: "-products",
          },
          {
            path: "colors",
            select: "-products",
          },
        ])
        .sort(sortOption);
      return res.status(200).json({ product: product });
    } catch (error) {
      next(error);
    }
  },
  getDetailProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id)
        .populate([
          {
            path: "categoryId",
            select: "-products",
          },
          {
            path: "colors",
            select: "-products",
          },
        ])
        .sort({ createdAt: -1 });
      res.send({ product: product });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  create: async (req, res, next) => {
    try {
      const { data } = req.body;
      const parserData = JSON.parse(data);
      const {
        name,
        price,
        categoryId,
        colors,
        soLuongSanPham,
        discription,
        discountPercent,
      } = parserData;
      const { file } = req;
      let imageUrl;
      let imagePublicId;

      if (file) {
        const uploadImage = await uploadToCloudinary(file, "products");
        if (!uploadImage.secure_url) {
          return res.status(205).send({ message: "Tải ảnh thất bại" });
        }
        imageUrl = uploadImage.secure_url;
        imagePublicId = uploadImage.public_id;
      }
      const product = await Product.findOne({ name });
      if (product) return res.status(205).json("Tên sản phẩm đã tồn tại");

      const priceConvert = Number(price);
      const soLuongSanPhamConvert = Number(soLuongSanPham);
      const discount = Number(discountPercent);
      const totalPriceAfterDiscount = Math.ceil(
        priceConvert * ((100 - discount) / 100)
      );

      const newProductAndCategory = {
        name,
        price: priceConvert,
        categoryId,
        image: imageUrl,
        imagePublicId,
        colors,
        discount: discountPercent,
        so_luong: soLuongSanPhamConvert,
        soluong_conlai: soLuongSanPhamConvert,
        discription,
        price_discount: totalPriceAfterDiscount,
      };
      const addProduct = await new Product(newProductAndCategory).save();

      await DanhMuc.findOneAndUpdate(
        { _id: categoryId },
        { $push: { products: addProduct } }
      );

      res.status(httpStatus.CREATED);
      res.json({
        product: addProduct,
        message: "Thêm sản phẩm thành công",
      });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      // Check đk ở đây

      await Product.findByIdAndDelete(id);
      res.status(200).json({ message: "Xóa sản phẩm thành công" });
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;

      // Kiểm tra xem sản phẩm có tồn tại trong cơ sở dữ liệu hay không
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }

      // Kiểm tra trạng thái hiện tại của sản phẩm
      if (product.status === STATUS.REJECT) {
        return res
          .status(400)
          .json({ message: "Sản phẩm đã ở trạng thái preject" });
      }

      // Cập nhật trạng thái của sản phẩm thành preject
      product.status = STATUS.REJECT;
      await product.save();

      return res.json({ message: "Cập nhật trạng thái sản phẩm thành công" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Export

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { data } = req.body;
      const parserData = JSON.parse(data);
      const {
        name,
        price,
        categoryId,
        colors,
        soLuongSanPham,
        soLuongThem,
        discription,
        discountPercent,
        // imageToDeletePublicId,
        ...field
      } = parserData;
      const findProduct = await Product.findById(id);
      const { file } = req;
      // Xử lý xóa ảnh cũ (nếu có)
      // if (imageToDeletePublicId) {
      //   const deleteImage = await deleteFromCloudinary(imageToDeletePublicId);
      //   if (deleteImage.result !== 'ok') {
      //     return res.status(500).send({ message: 'Error deleting image' });
      //   }
      // }

      let imageUrl = "";
      let imagePublicId = "";

      // Xử lý tải lên ảnh mới (nếu có)
      if (file) {
        const uploadImage = await uploadToCloudinary(file, "products");
        if (!uploadImage.secure_url) {
          return res.status(500).send({ message: "Tải ảnh thất bại" });
        }
        imageUrl = uploadImage.secure_url;
        imagePublicId = uploadImage.public_id;
      }

      // Cập nhật thông tin sản phẩm
      try {
        const priceConvert = Number(price);
        const soLuongSanPhamConvert = Number(soLuongSanPham);
        const discount = Number(discountPercent);
        const soLuongThemConvert = Number(soLuongThem);
        const totalPriceAfterDiscount = Math.ceil(
          priceConvert * ((100 - discount) / 100)
        );

        const updatedProduct = {
          name,
          price: priceConvert,
          categoryId,
          image: imageUrl,
          imagePublicId,
          colors,
          discount: discountPercent,
          so_luong: soLuongSanPhamConvert + soLuongThemConvert,
          soluong_conlai: findProduct.soluong_conlai + soLuongThemConvert,
          discription,
          price_discount: totalPriceAfterDiscount,
          ...field,
        };

        const productUpdate = await Product.findOneAndUpdate(
          { _id: id },
          { ...updatedProduct },
          { new: true }
        );

        res.json({
          product: productUpdate,
          message: "Cập nhật sản phẩm thành công",
        });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};
module.exports = { ProductController };
