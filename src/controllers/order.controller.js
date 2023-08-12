/* eslint-disable camelcase */
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const mongoose = require("mongoose");

const OrdersController = {
  listPaginate: async (req, res, next) => {
    try {
      const perPage = parseInt(req.query.per_page, 10) || 10; // Number of items per page
      const currentPage = parseInt(req.query.current_page, 10) || 1; // Current page number
      const searchTerm = req.query.order_id || ""; // Search term

      const filter = {
        order_id: { $regex: searchTerm, $options: "i" },
      };

      const totalCount = await Order.countDocuments(filter); // Total count of matching documents
      const totalPages = Math.ceil(totalCount / perPage); // Total number of pages

      const skipCount = perPage * (currentPage - 1); // Number of documents to skip

      const order = await Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skipCount)
        .limit(perPage)
        .exec();

      res.send({
        content: order,
        size: perPage,
        totalElements: totalCount,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },
  getAllOrderByUser: async (req, res, next) => {
    try {
      const perPage = parseInt(req.query.per_page, 10) || 10; // số lượng sản phẩm xuất hiện trên 1 page
      const page = parseInt(req.query.current_page, 10) || 0;

      const user_id = req.query.user_id || "";

      if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
        return res.status(500).json({ message: "Không tìm thấy user" });
      }
      const filter = {
        user: mongoose.Types.ObjectId(user_id),
      };

      const totalElements = await Order.countDocuments(filter);
      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(perPage * page)
        .limit(perPage)
        .exec();
      const totalPages = Math.ceil(totalElements / perPage);
      res.send({
        content: orders,
        size: perPage,
        totalElements: totalElements,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      // Lấy dữ liệu từ request body
      const {
        order_id,
        cart,
        firstName,
        lastName,
        phone,
        email,
        address,
        total_product,
        total_price,
        user,
        orderStatus,
      } = req.body;

      // Tạo đối tượng Order mới
      const newOrder = new Order({
        order_id,
        cart,
        firstName,
        lastName,
        phone,
        email,
        address,
        total_product,
        total_price,
        user,
        orderStatus,
      });

      // Lưu đơn hàng vào cơ sở dữ liệu
      const savedOrder = await newOrder.save();
      res
        .status(200)
        .json({ order: savedOrder, message: "Đặt hàng thành công" });
    } catch (error) {
      next(error);
    }
  },
  // duyetDonHang = async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const order = await Order.findByIdAndUpdate(
  //       { _id: id },
  //       { allow_status: 1 },
  //       { new: true }
  //     );

  //     return res.json({ message: 'Duyệt đơn hàng thành công' });
  //   } catch (error) {
  //     return res.status(500).json({ message: error.message });
  //   }
  // };
  duyetDonHang: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      order.cart.forEach(async (item) => {
        const product = await Product.findById(item._id);
        if (product) {
          const newQuantity = product.soluong_conlai - item.cartQuantity;
          product.soluong_conlai = newQuantity;
          await product.save();
        }
      });

      const updatedOrder = await Order.findByIdAndUpdate(
        { _id: id },
        { allow_status: 1 },
        { new: true }
      );

      return res.json({ message: "Duyệt đơn hàng thành công" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  xoaDonHangUser: async (req, res) => {
    try {
      const { id } = req.params;

      const updatedOrder = await Order.findByIdAndUpdate(
        { _id: id },
        { allow_status: 2 },
        { new: true }
      );

      return res.json({ message: "Hủy đơn hàng thành công" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = { OrdersController };
