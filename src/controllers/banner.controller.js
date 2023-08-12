/* eslint-disable consistent-return */
const Banner = require("../models/banner.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");

const BannerController = {
  listPaginate: async (req, res, next) => {
    try {
      const perPage = parseInt(req.query.per_page, 10) || 10; // Number of items per page
      const currentPage = parseInt(req.query.current_page, 10) || 1; // Current page number

      const totalCount = await Banner.countDocuments(); // Total count of matching documents
      const totalPages = Math.ceil(totalCount / perPage); // Total number of pages
      const skipCount = perPage * (currentPage - 1); // Number of documents to skip

      const banner = await Banner.find().skip(skipCount).limit(perPage).exec();

      res.send({
        content: banner,
        size: perPage,
        totalElements: totalCount,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },
  getAllBanner: async (req, res) => {
    try {
      const banner = await Banner.find();
      res.json(banner);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  uploadBanner: async (req, res) => {
    try {
      const { imagePublicId, coverImagePublicId, isCover } = req.body;
      const file = req.file;
      if (!file) {
        return res.status(500).send("Vui lòng tải ảnh lên");
      }
      if (file && !file.mimetype.match(/image-*/)) {
        return res.status(500).send("Ảnh không đúng định dạng");
      }
      const coverOrImagePublicId =
        isCover === "true" ? coverImagePublicId : imagePublicId;
      const uploadImage = await uploadToCloudinary(
        file,
        "banners",
        coverOrImagePublicId
      );
      if (uploadImage.secure_url) {
        const addimage = {};
        if (isCover === "true") {
          addimage.coverImage = uploadImage.secure_url;
          addimage.coverImagePublicId = uploadImage.public_id;
        } else {
          addimage.imageBanner = uploadImage.secure_url;
          addimage.imagePublicId = uploadImage.public_id;
        }
        const newBanner = new Banner(addimage);
        await newBanner.save();
        res.send({
          banner: newBanner,
          message: "Tải ảnh quảng cáo thành công",
        });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  deleteBanner: async (req, res) => {
    try {
      const { imagePublicId } = req.body;
      const { id } = req.params;
      if (imagePublicId) {
        const deleteImage = await deleteFromCloudinary(imagePublicId);
        if (deleteImage.result !== "ok") {
          return res
            .status(500)
            .send({ message: "Có lỗi xảy ra trong quá trình xóa ảnh" });
        }
      }
      await Banner.findByIdAndDelete(id);
      res.json({ message: "Xóa ảnh quảng cáo thành công" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = { BannerController };
