const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Create Post
router.post('/add/:id', async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = new Post({ title, content, userId: req.params.id});
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit Post
router.put('/:id/:userId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.params.userId.toString())
      return res.status(403).json({ message: 'Unauthorized' });

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Post
router.delete('/:id/:userId', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.params.userId.toString())
      return res.status(403).json({ message: 'Unauthorized' });

    res.json({ message: 'Post removed' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Comment to Post
router.post('/:id/:userId/comments', async (req, res) => {
  const { comment } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ userId: req.params.userId, comment });
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
