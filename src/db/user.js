const User = require("../models/userModel");

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};
const getAuthUser = async (id) => {
  const user = await User.findOneAndUpdate(
    { _id: id },
    { isOnline: true }
  ).select("-password");
  // .populate({ path: "posts", options: { sort: { createdAt: "desc" } } })
  // .populate("likes")
  // .populate("followers")
  // .populate("following")
  // .populate({
  //   path: "notifications",
  //   populate: [
  //     { path: "author" },
  //     { path: "like", populate: { path: "post" } },
  //     { path: "comment", populate: { path: "post" } },
  //   ],
  //   match: { seen: false },
  // });

  return user;
};

const createUser = async (fullName, email, password) => {
  const user = await User.create({
    fullName,
    email,
    password,
  });
  return user;
};
const deleteUser = async (id) => {
  const user = await User.findByIdAndRemove(id);
  return user;
};
const updateUserResetPasswordToken = async (userId, token) => {
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { resetPasswordToken: token }
  );
  return user;
};
const updatePassword = async (id, password) => {
  const user = await User.findOneAndUpdate(
    { _id: id },
    { password },
    { new: true }
  );
  return user;
};
module.exports = {
  createUser,
  getUserByEmail,
  deleteUser,
  getAuthUser,
  updateUserResetPasswordToken,
  updatePassword,
};
