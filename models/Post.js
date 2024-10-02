const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String },
  image: { type: String },
  content: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment: { type: String, required: true }
    }
  ],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
