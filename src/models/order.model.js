const mongoose = require("mongoose");
const { orderStatus } = require("../constants/commons");
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    cart: {
      type: Array,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    total_product: {
      type: Number,
      default: 0,
    },
    total_price: {
      type: Number,
      default: 0,
    },

    allow_status: {
      type: Number,
      default: 0,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    orderStatus: {
      type: String,
      default: orderStatus.cash,
    },
    isPayment: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
