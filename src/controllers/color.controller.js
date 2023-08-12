/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
const httpStatus = require("http-status");
const Color = require("../models/color.model");

const ColorController = {
  listPaginate: async (req, res, next) => {
    try {
      const perPage = parseInt(req.query.per_page, 10) || 10; // Number of items per page
      const currentPage = parseInt(req.query.current_page, 10) || 1; // Current page number
      const searchTerm = req.query.name || ""; // Search term

      const filter = {
        name: { $regex: searchTerm, $options: "i" },
      };

      const totalCount = await Color.countDocuments(filter); // Total count of matching documents
      const totalPages = Math.ceil(totalCount / perPage); // Total number of pages

      const skipCount = perPage * (currentPage - 1); // Number of documents to skip

      const color = await Color.find(filter)
        .skip(skipCount)
        .limit(perPage)
        .exec();

      res.send({
        content: color,
        size: perPage,
        totalElements: totalCount,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },

  getAllColor: async (req, res) => {
    try {
      const color = await Color.find();
      res.json(color);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  create: async (req, res, next) => {
    try {
      const { name } = req.body;
      const checkMauSacTonTai = await Color.findOne({ name });
      if (checkMauSacTonTai) {
        return res.json(req.json({ message: "Màu sắc đã tồn tại" }));
      }
      const color = new Color({ name });
      const savedColor = await color.save();
      res.status(httpStatus.CREATED);
      res.json({
        color: savedColor,
        message: "Thêm mới màu sắc thành công",
      });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const color = await Color.find();
      const checkMausac = color.filter((item) => item.products.length > 0);
      if (checkMausac.length) {
        return res
          .status(500)
          .json({ message: "Sản phẩm chứa màu sắc, không thể xóa" });
      }
      await Color.findByIdAndDelete(id);
      res.status(200).json({ message: "Xóa màu sắc thành công" });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const categoryUpdate = await Color.findOneAndUpdate(
        { _id: id },
        { name },
        { new: true }
      );
      res.json({
        color: categoryUpdate,
        message: "Cập nhật màu sắc thành công",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};
module.exports = { ColorController };
