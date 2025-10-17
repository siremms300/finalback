// routes/BlogRouter.js
const express = require('express');
const BlogRouter = express.Router();
const BlogController = require('../Controller/BlogController');
const { authenticateUser } = require('../middleware/UserAuthenticationMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for blog image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit for blog images
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Public routes
BlogRouter.get('/', BlogController.getAllBlogs);
BlogRouter.get('/stats', BlogController.getBlogStats);
BlogRouter.get('/:slug', BlogController.getBlogBySlug);
BlogRouter.get('/id/:id', BlogController.getBlogById); 

// Protected routes
BlogRouter.post('/', authenticateUser, upload.single('featuredImage'), BlogController.createBlog);
BlogRouter.put('/:id', authenticateUser, upload.single('featuredImage'), BlogController.updateBlog);
BlogRouter.delete('/:id', authenticateUser, BlogController.deleteBlog);
BlogRouter.post('/:id/like', authenticateUser, BlogController.toggleLike);
BlogRouter.post('/:id/comment', authenticateUser, BlogController.addComment);

module.exports = BlogRouter;



























































































































// // routes/BlogRouter.js
// const express = require('express');
// const BlogRouter = express.Router();
// const BlogController = require('../Controller/BlogController');
// const { authenticateUser } = require('../middleware/UserAuthenticationMiddleware');
// const multer = require('multer');
// const path = require('path');



// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
//   }
// });


// const fileFilter = (req, file, cb) => {
//   // Allow only specific file types
//   if (file.mimetype === 'application/pdf' || 
//       file.mimetype === 'image/jpeg' || 
//       file.mimetype === 'image/png' ||
//       file.mimetype === 'application/msword' ||
//       file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and Word documents are allowed.'), false);
//   }
// };


// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB limit
//   }
// });

// // Public routes
// BlogRouter.get('/', BlogController.getAllBlogs);
// BlogRouter.get('/stats', BlogController.getBlogStats);
// BlogRouter.get('/:slug', BlogController.getBlogBySlug);

// // Protected routes
// BlogRouter.post('/', authenticateUser, upload.single('featuredImage'), BlogController.createBlog);
// BlogRouter.put('/:id', authenticateUser, upload.single('featuredImage'), BlogController.updateBlog);
// BlogRouter.delete('/:id', authenticateUser, BlogController.deleteBlog);
// BlogRouter.post('/:id/like', authenticateUser, BlogController.toggleLike);
// BlogRouter.post('/:id/comment', authenticateUser, BlogController.addComment);

// module.exports = BlogRouter;