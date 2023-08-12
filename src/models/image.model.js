const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new mongoose.Schema(
  {
    name: { type: String },
    image: {
      type: String,
    },

    imagePublicId: {
      type: String,
    },
    coverImage: String,
    coverImagePublicId: String,
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
