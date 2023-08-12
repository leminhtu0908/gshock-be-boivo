const mongoose = require('mongoose');
const { STATUSES, STATUS } = require('../../constants/commons');

const Schema = mongoose.Schema;

const bannerSchema = new mongoose.Schema(
  {
    imageBanner: {
      type: String,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: STATUS.ACTIVE,
    },
    imagePublicId: {
      type: String,
    },
    coverImage: String,
    coverImagePublicId: String,
  },
  {
    timestamps: true,
  }
);
const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
