/* eslint-disable comma-dangle */
const mongoose = require("mongoose");
const { MODEL, STATUSES, STATUS } = require("../constants/commons");

/**
 * Danh muc Schema
 * @private
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: String,
    imagePublicId: String,
    colors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: MODEL.COLOR,
      },
    ],
    // imageDetail: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: MODEL.IMAGE,
    //   },
    // ],
    discription: String, // chi tiết
    price_discount: Number,
    discount: Number,
    so_luong: Number,
    soluong_conlai: Number,
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODEL.DANH_MUC,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model(MODEL.PRODUCT, productSchema);
