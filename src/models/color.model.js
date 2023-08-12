/* eslint-disable comma-dangle */
const mongoose = require("mongoose");
const { MODEL, STATUSES, STATUS } = require("../constants/commons");

/**
 * Color Schema
 * @private
 */
const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: MODEL.AMENITY,
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
module.exports = mongoose.model(MODEL.COLOR, colorSchema);
