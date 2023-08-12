const mongoose = require("mongoose");
const { UserRole, UserGender } = require("../constants/type");
//tạo bảng user gồm các field : name,email,password,
const Schema = mongoose.Schema;
const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      default: UserRole.User,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dateofbirth: {
      type: String,
    },
    address: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: UserGender.Default,
    },
    banned: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
    },
    image: {
      type: String,
    },
    imagePublicId: {
      type: String,
    },
    nickName: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    coverImage: String,
    coverImagePublicId: String,
    order: [],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
