const User = require("../models/userModel");
const { uploadToCloudinary } = require("../utils/cloudinary");

const UserCtrl = {
  getAllUser: async (req, res) => {
    try {
      const user = await User.find();
      res.json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  getUserById: async (req, res) => {
    try {
      const { id } = req.body;
      const user = await User.findById(id);
      res.json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  getUserByEmail: async (req, res) => {
    try {
      const { email } = req.query;
      const user = await User.findOne({ email });
      res.json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  banUser: async (req, res) => {},
  uploadPhoto: async (req, res) => {
    const { imagePublicId, coverImagePublicId, isCover } = req.body;
    const authUser = req.user;
    const image = req.file;
    if (!image) {
      return res.status(500).send("Vui lòng tải ảnh lên");
    }
    if (image && !image.mimetype.match(/image-*/)) {
      return res.status(500).send("Ảnh không đúng định dạng");
    }

    const coverOrImagePublicId =
      isCover === "true" ? coverImagePublicId : imagePublicId;
    const uploadImage = await uploadToCloudinary(
      image,
      "user",
      coverOrImagePublicId
    );

    if (uploadImage.secure_url) {
      const fieldsToUpdate = {};

      if (isCover === "true") {
        fieldsToUpdate.coverImage = uploadImage.secure_url;
        fieldsToUpdate.coverImagePublicId = uploadImage.public_id;
      } else {
        fieldsToUpdate.image = uploadImage.secure_url;
        fieldsToUpdate.imagePublicId = uploadImage.public_id;
      }

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: authUser._id,
        },
        fieldsToUpdate
      );
      return res.json({ user: updatedUser, message: "Lưu ảnh thành công" });
    }
    return res
      .status(500)
      .send({ message: "Lưu ảnh thất bại, vui lòng thử lại" });
  },
  updateUser: async (req, res) => {
    try {
      const {
        fullName,
        email,
        _id,
        dateofbirth,
        address,
        phone,
        gender,
        nickName,
      } = req.body;
      const userUpdate = await User.findOneAndUpdate(
        { _id: _id },
        { fullName, email, dateofbirth, address, gender, phone, nickName }
      );
      res.json({ user: userUpdate, message: "Cập nhật thông tin thành công" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};
module.exports = UserCtrl;
