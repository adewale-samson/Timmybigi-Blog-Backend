const express = require("express");
const Post = require("../models/Post");
const path = require("path")
const authMiddleware = require("../middleware/authMiddleware");
const cloudinary = require("cloudinary");
const multer = require("multer");
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: "djghlquej",
  api_key: "662425916612261",
  api_secret: "sZJgrz7rbaCuIBrkTUXDQkG87M4",
});

// Multer config for images and videos
const storage = multer.diskStorage({
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".mp4",
      ".mov",
      ".avi",
      ".pdf",
      ".docx",
    ];

    let ext = path.extname(file.originalname);

    // Check if the file extension is allowed
    if (allowedExtensions.includes(ext.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("File type is not supported"), false);
    }
  },
});

const upload = multer({ storage });

// Create Post with Image
router.post("/add/:id", upload.single("image"), async (req, res) => {
  const { title, content } = req.body;
  const result = await cloudinary.v2.uploader.upload(req.file.path);
  
  try {
    const post = new Post({
      title,
      content,
      userId: req.params.id,
      image: result.secure_url,
    });
    await post.save();

    res.json(post);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Server error" });
  }
});

// Edit Post
router.put("/:id/:userId/",  async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.params.userId.toString())
      return res.status(403).json({ message: "Unauthorized" });

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// Delete Post
router.delete("/:id/:userId/",  async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.params.userId.toString())
      return res.status(403).json({ message: "Unauthorized" });


    res.json({ message: "Post removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add Comment to Post
router.post("/:id/:userId/comments", async (req, res) => {
  const { comment } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ userId: req.params.userId, comment });
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/post", async (req, res) => {
  try {
    // const post = await Post.findById(req.params.id);
    const post = await Post.find();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
