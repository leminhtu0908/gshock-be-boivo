const httpStatus = require("http-status");
const User = require("../models/userModel");
const { uploadToCloudinary } = require("../utils/cloudinary");

const UserController = {
  listPaginate: async (req, res, next) => {
    try {
      const perPage = parseInt(req.query.per_page, 10) || 10; // Number of items per page
      const currentPage = parseInt(req.query.current_page, 10) || 1; // Current page number
      const searchTerm = req.query.name || ""; // Search term

      const filter = {
        name: { $regex: searchTerm, $options: "i" },
      };

      const totalCount = await User.countDocuments(filter); // Total count of matching documents
      const totalPages = Math.ceil(totalCount / perPage); // Total number of pages

      const skipCount = perPage * (currentPage - 1); // Number of documents to skip

      const user = await User.find(filter)
        .skip(skipCount)
        .limit(perPage)
        .exec();

      res.send({
        content: user,
        size: perPage,
        totalElements: totalCount,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  },
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { data } = req.body;
      const parserData = JSON.parse(data);
      const { name, firstName, lastName, address, email, phone, ...field } =
        parserData;

      const { file } = req;

      let imageUrl = "";
      let imagePublicId = "";

      // Xử lý tải lên ảnh mới (nếu có)
      if (file) {
        const uploadImage = await uploadToCloudinary(file, "users");
        if (!uploadImage.secure_url) {
          return res.status(500).send({ message: "Tải ảnh thất bại" });
        }
        imageUrl = uploadImage.secure_url;
        imagePublicId = uploadImage.public_id;
      }

      // Cập nhật thông tin user
      try {
        const updatedUser = await {
          name,
          firstName,
          lastName,
          address,
          email,
          phone,
          image: imageUrl,
          imagePublicId,

          ...field,
        };

        const userUpdate = await User.findOneAndUpdate(
          { _id: id },
          { ...updatedUser },
          { new: true }
        );

        res.json({
          user: userUpdate,
          message: "Cập nhật người dùng thành công",
        });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  getUserById: async (req, res) => {
    try {
      const { id } = req.query;
      const user = await User.findById(id);
      res.json({
        user: user,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = { UserController };
