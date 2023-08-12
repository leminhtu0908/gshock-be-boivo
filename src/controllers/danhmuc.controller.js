/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
const httpStatus = require("http-status");
const DanhMuc = require("../models/danhmuc.model");

const DanhMucController = {
  listPaginate: async (req, res, next) => {
    try {
      const perPage = parseInt(req.query.per_page, 10) || 10; // Number of items per page
      const currentPage = parseInt(req.query.current_page, 10) || 1; // Current page number
      const searchTerm = req.query.name || ""; // Search term

      const filter = {
        name: { $regex: searchTerm, $options: "i" },
      };

      const totalCount = await DanhMuc.countDocuments(filter); // Total count of matching documents
      const totalPages = Math.ceil(totalCount / perPage); // Total number of pages

      const skipCount = perPage * (currentPage - 1); // Number of documents to skip

      const danhmuc = await DanhMuc.find(filter)
        .skip(skipCount)
        .limit(perPage)
        .exec();

      res.send({
        content: danhmuc,
        size: perPage,
        totalElements: totalCount,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },
  getAllCategories: async (req, res) => {
    try {
      const categories = await DanhMuc.find();
      res.json(categories);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  create: async (req, res, next) => {
    try {
      const { name } = req.body;
      const checkDanhMucTonTai = await DanhMuc.findOne({ name });
      if (checkDanhMucTonTai) {
        return res.json(req.json({ message: "Danh mục đã tồn tại" }));
      }
      const danhmuc = new DanhMuc({ name });
      const savedDanhnuc = await danhmuc.save();
      res.status(httpStatus.CREATED);
      res.json({
        danhmuc: savedDanhnuc,
        message: "Thêm mới danh mục thành công",
      });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const danhmuc = await DanhMuc.findById(id);

      if (danhmuc.products.length > 0) {
        return res
          .status(500)
          .json({ message: "Danh mục chứa sản phẩm, không thể xóa" });
      }
      await DanhMuc.findByIdAndDelete(id);
      res.status(200).json({ message: "Xóa danh mục thành công" });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const categoryUpdate = await DanhMuc.findOneAndUpdate(
        { _id: id },
        { name },
        { new: true }
      );
      res.json({
        danhmuc: categoryUpdate,
        message: "Cập nhật danh mục thành công",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = { DanhMucController };
