const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("posts", postSchema);
