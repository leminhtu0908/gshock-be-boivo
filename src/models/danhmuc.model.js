/* eslint-disable comma-dangle */
const mongoose = require("mongoose");
const { MODEL, STATUSES, STATUS } = require("../constants/commons");

/**
 * Danh muc Schema
 * @private
 */
const danhmucSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: MODEL.PRODUCT,
      },
    ],
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
module.exports = mongoose.model(MODEL.DANH_MUC, danhmucSchema);
