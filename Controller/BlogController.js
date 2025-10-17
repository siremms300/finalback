// controllers/BlogController.js
const Blog = require('../Model/BlogModel');
const User = require('../Model/UserModel');
const fs = require('fs');
const path = require('path');



// Add these helper functions to BlogController.js if missing

// Helper function to process categories
const processCategories = (categories) => {
  if (!categories) return ['General']; // Default category
  
  let categoriesArray = [];
  
  if (Array.isArray(categories)) {
    categoriesArray = categories.filter(cat => cat && cat.trim() !== '');
  } else if (typeof categories === 'string') {
    // Handle comma-separated string or single category
    categoriesArray = categories.split(',')
      .map(cat => cat.trim())
      .filter(cat => cat !== '');
  }
  
  // If no valid categories, use default
  if (categoriesArray.length === 0) {
    categoriesArray = ['General'];
  }
  
  return categoriesArray;
};

// Helper function to process tags
const processTags = (tags) => {
  if (!tags) return [];
  
  let tagsArray = [];
  
  if (Array.isArray(tags)) {
    tagsArray = tags.filter(tag => tag && tag.trim() !== '');
  } else if (typeof tags === 'string') {
    tagsArray = tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
  }
  
  return tagsArray;
};



// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
};

// Helper function to calculate read time
const calculateReadTime = (content) => {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
};

// Create new blog post
// exports.createBlog = async (req, res) => {
//   let uploadedFile = null;
  
//   try {
//     const { title, excerpt, content, categories, tags, metaTitle, metaDescription, keywords, status, featured } = req.body;
    
//     // Check if user is authorized to create blog posts
//     if (!req.user.role || !['admin', 'recruiter', 'blogger'].includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Unauthorized to create blog posts'
//       });
//     }

//     // Generate slug and read time
//     const slug = generateSlug(title);
//     const readTime = calculateReadTime(content);

//     const blogData = {
//       title,
//       slug, // Add the generated slug
//       excerpt,
//       content,
//       readTime, // Add calculated read time
//       categories: Array.isArray(categories) ? categories : [categories],
//       tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
//       author: req.user._id,
//       status: status || 'draft',
//       featured: featured === 'true'
//     };

//     // Set publishedAt if status is published
//     if (status === 'published') {
//       blogData.publishedAt = new Date();
//     }

//     if (metaTitle) blogData.metaTitle = metaTitle;
//     if (metaDescription) blogData.metaDescription = metaDescription;
//     if (keywords) blogData.keywords = Array.isArray(keywords) ? keywords : keywords.split(',').map(kw => kw.trim());

//     // Handle featured image upload (local storage)
//     if (req.file) {
//       uploadedFile = req.file;
//       blogData.featuredImage = {
//         url: `/uploads/${req.file.filename}`,
//         filePath: req.file.path,
//         alt: title,
//         caption: req.body.imageCaption || '',
//         size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB'
//       };
//     }

//     const blog = await Blog.create(blogData);

//     // Populate author info
//     await blog.populate('author', 'username email profilePicture');

//     res.status(201).json({
//       success: true,
//       message: 'Blog post created successfully',
//       data: blog
//     });
//   } catch (error) {
//     console.error('Create blog error:', error);
    
//     // Clean up uploaded file if there was an error
//     if (uploadedFile && fs.existsSync(uploadedFile.path)) {
//       fs.unlinkSync(uploadedFile.path);
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create blog post',
//       error: error.message
//     });
//   }
// };


// controllers/BlogController.js - Update the createBlog function
// exports.createBlog = async (req, res) => {
//   let uploadedFile = null;
  
//   try {
//     const { title, excerpt, content, categories, tags, metaTitle, metaDescription, keywords, status, featured } = req.body;
    
//     // Check if user is authorized to create blog posts
//     if (!req.user.role || !['admin', 'recruiter', 'blogger'].includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Unauthorized to create blog posts'
//       });
//     }

//     // Validate required fields with better error messages
//     if (!title || !excerpt || !content) {
//       return res.status(400).json({
//         success: false,
//         message: 'Title, excerpt, and content are required fields'
//       });
//     }

//     // Debug log to see what content is being received
//     console.log('Content received:', {
//       contentLength: content.length,
//       contentPreview: content.substring(0, 100) + '...',
//       contentType: typeof content
//     });

//     // Validate content length (strip HTML tags for character count)
//     const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
//     if (textContent.length < 100) {
//       return res.status(400).json({
//         success: false,
//         message: 'Content must be at least 100 characters (excluding HTML tags)',
//         characterCount: textContent.length
//       });
//     }

//     // Generate slug and read time
//     const slug = generateSlug(title);
//     const readTime = calculateReadTime(textContent); // Use text content for word count

//     // Process categories and tags
//     const processedCategories = processCategories(categories);
//     const processedTags = processTags(tags);

//     const blogData = {
//       title,
//       slug,
//       excerpt,
//       content, // This includes HTML
//       readTime,
//       categories: processedCategories,
//       tags: processedTags,
//       author: req.user._id,
//       status: status || 'draft',
//       featured: featured === 'true'
//     };

//     // Set publishedAt if status is published
//     if (status === 'published') {
//       blogData.publishedAt = new Date();
//     }

//     if (metaTitle) blogData.metaTitle = metaTitle;
//     if (metaDescription) blogData.metaDescription = metaDescription;
    
//     // Process keywords
//     if (keywords) {
//       blogData.keywords = Array.isArray(keywords) 
//         ? keywords.filter(kw => kw && kw.trim() !== '')
//         : keywords.split(',').map(kw => kw.trim()).filter(kw => kw !== '');
//     }

//     // Handle featured image upload (local storage)
//     if (req.file) {
//       uploadedFile = req.file;
//       blogData.featuredImage = {
//         url: `/uploads/${req.file.filename}`,
//         filePath: req.file.path,
//         alt: title,
//         caption: req.body.imageCaption || '',
//         size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB'
//       };
//     }

//     console.log('Creating blog with data:', {
//       title: blogData.title,
//       slug: blogData.slug,
//       contentLength: blogData.content.length,
//       categories: blogData.categories,
//       status: blogData.status
//     });

//     const blog = await Blog.create(blogData);

//     // Populate author info
//     await blog.populate('author', 'username email profilePicture');

//     res.status(201).json({
//       success: true,
//       message: 'Blog post created successfully',
//       data: blog
//     });
//   } catch (error) {
//     console.error('Create blog error:', error);
    
//     // Clean up uploaded file if there was an error
//     if (uploadedFile && fs.existsSync(uploadedFile.path)) {
//       fs.unlinkSync(uploadedFile.path);
//     }
    
//     // More specific error messages
//     let errorMessage = 'Failed to create blog post';
//     if (error.name === 'ValidationError') {
//       errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
//     }
    
//     res.status(500).json({
//       success: false,
//       message: errorMessage,
//       error: error.message
//     });
//   }
// };

// controllers/BlogController.js - Update createBlog function with better debugging
exports.createBlog = async (req, res) => {
  let uploadedFile = null;
  
  try {
    const { title, excerpt, content, categories, tags, metaTitle, metaDescription, keywords, status, featured } = req.body;
    
    // Check if user is authorized to create blog posts
    if (!req.user.role || !['admin', 'recruiter', 'blogger'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to create blog posts'
      });
    }

    // Validate required fields with better error messages
    if (!title || !excerpt || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, excerpt, and content are required fields'
      });
    }

    // Debug log to see what content is being received
    console.log('Content received:', {
      contentLength: content.length,
      contentPreview: content.substring(0, 200) + '...',
      contentType: typeof content,
      isUndefined: content === 'undefined'
    });

    // Check if content is actually 'undefined' string
    if (content === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Content cannot be empty. Please add some content to your blog post.'
      });
    }

    // Validate content length (strip HTML tags for character count)
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    console.log('Text content after stripping HTML:', {
      textLength: textContent.length,
      textPreview: textContent.substring(0, 200) + '...'
    });

    if (textContent.length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 100 characters (excluding HTML tags)',
        characterCount: textContent.length
      });
    }

    // Generate slug and read time
    const slug = generateSlug(title);
    const readTime = calculateReadTime(textContent); // Use text content for word count

    // Process categories and tags
    const processedCategories = processCategories(categories);
    const processedTags = processTags(tags);

    const blogData = {
      title,
      slug,
      excerpt,
      content, // This includes HTML
      readTime,
      categories: processedCategories,
      tags: processedTags,
      author: req.user._id,
      status: status || 'draft',
      featured: featured === 'true'
    };

    // Set publishedAt if status is published
    if (status === 'published') {
      blogData.publishedAt = new Date();
    }

    if (metaTitle) blogData.metaTitle = metaTitle;
    if (metaDescription) blogData.metaDescription = metaDescription;
    
    // Process keywords
    if (keywords) {
      blogData.keywords = Array.isArray(keywords) 
        ? keywords.filter(kw => kw && kw.trim() !== '')
        : keywords.split(',').map(kw => kw.trim()).filter(kw => kw !== '');
    }

    // Handle featured image upload (local storage)
    if (req.file) {
      uploadedFile = req.file;
      blogData.featuredImage = {
        url: `/uploads/${req.file.filename}`,
        filePath: req.file.path,
        alt: title,
        caption: req.body.imageCaption || '',
        size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB'
      };
    }

    console.log('Creating blog with data:', {
      title: blogData.title,
      slug: blogData.slug,
      contentLength: blogData.content.length,
      textContentLength: textContent.length,
      categories: blogData.categories,
      status: blogData.status
    });

    const blog = await Blog.create(blogData);

    // Populate author info
    await blog.populate('author', 'username email profilePicture');

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    
    // Clean up uploaded file if there was an error
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }
    
    // More specific error messages
    let errorMessage = 'Failed to create blog post';
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};




// Update blog post
exports.updateBlog = async (req, res) => {
  let uploadedFile = null;
  
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this blog post'
      });
    }

    // Regenerate slug if title is being updated
    if (updateData.title && updateData.title !== blog.title) {
      updateData.slug = generateSlug(updateData.title);
    }

    // Recalculate read time if content is being updated
    if (updateData.content) {
      updateData.readTime = calculateReadTime(updateData.content);
    }

    // Handle array fields
    if (updateData.categories) {
      updateData.categories = Array.isArray(updateData.categories) ? updateData.categories : [updateData.categories];
    }
    if (updateData.tags) {
      updateData.tags = Array.isArray(updateData.tags) ? updateData.tags : updateData.tags.split(',').map(tag => tag.trim());
    }
    if (updateData.keywords) {
      updateData.keywords = Array.isArray(updateData.keywords) ? updateData.keywords : updateData.keywords.split(',').map(kw => kw.trim());
    }

    // Handle featured image upload (local storage)
    if (req.file) {
      uploadedFile = req.file;
      updateData.featuredImage = {
        url: `/uploads/${req.file.filename}`,
        filePath: req.file.path,
        alt: updateData.title || blog.title,
        caption: updateData.imageCaption || blog.featuredImage?.caption || '',
        size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB'
      };

      // Delete old featured image if it exists
      if (blog.featuredImage && blog.featuredImage.filePath && fs.existsSync(blog.featuredImage.filePath)) {
        fs.unlinkSync(blog.featuredImage.filePath);
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username profilePicture');

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedBlog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    
    // Clean up uploaded file if there was an error
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update blog post',
      error: error.message
    });
  }
};


// Get all blog posts with filtering and pagination
exports.getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'published',
      category,
      tag,
      author,
      featured,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { status };
    
    // Filter by category
    if (category) {
      query.categories = { $in: [category] };
    }
    
    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // Filter by author
    if (author) {
      query.author = author;
    }
    
    // Filter by featured
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const blogs = await Blog.find(query)
      .populate('author', 'username profilePicture')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content'); // Don't send full content in list

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: blogs
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message
    });
  }
};

// Get single blog post by slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug, status: 'published' })
      .populate('author', 'username profilePicture bio')
      .populate('comments.user', 'username profilePicture')
      .populate('comments.replies.user', 'username profilePicture');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      error: error.message
    });
  }
};

// Delete blog post
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this blog post'
      });
    }

    // Delete featured image file if it exists
    if (blog.featuredImage && blog.featuredImage.filePath && fs.existsSync(blog.featuredImage.filePath)) {
      fs.unlinkSync(blog.featuredImage.filePath);
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post',
      error: error.message
    });
  }
};

// Like/Unlike blog post
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const hasLiked = blog.likes.includes(userId);
    
    if (hasLiked) {
      // Unlike
      blog.likes = blog.likes.filter(like => like.toString() !== userId.toString());
    } else {
      // Like
      blog.likes.push(userId);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: hasLiked ? 'Blog unliked' : 'Blog liked',
      data: {
        likes: blog.likes.length,
        hasLiked: !hasLiked
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
};

// Add comment to blog post
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const comment = {
      user: req.user._id,
      content
    };

    blog.comments.push(comment);
    await blog.save();

    await blog.populate('comments.user', 'username profilePicture');

    const newComment = blog.comments[blog.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Get blog statistics
exports.getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments({ status: 'published' });
    const totalViews = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const topBlogs = await Blog.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title slug views');

    res.status(200).json({
      success: true,
      data: {
        totalBlogs,
        totalViews: totalViews[0]?.totalViews || 0,
        topBlogs
      }
    });
  } catch (error) {
    console.error('Get blog stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog statistics',
      error: error.message
    });
  }
};


// Get single blog post by ID
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id)
      .populate('author', 'username profilePicture bio')
      .populate('comments.user', 'username profilePicture')
      .populate('comments.replies.user', 'username profilePicture');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      error: error.message
    });
  }
};


























































































// // controllers/BlogController.js
// const Blog = require('../Model/BlogModel');
// const User = require('../Model/UserModel');
// const { uploadToCloudinary } = require('../Utils/cloudinary'); 




// // Create new blog post
// exports.createBlog = async (req, res) => {
//   try {
//     const { title, excerpt, content, categories, tags, metaTitle, metaDescription, keywords, status, featured } = req.body;
    
//     // Check if user is authorized to create blog posts
//     if (!req.user.role || !['admin', 'recruiter', 'blogger'].includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Unauthorized to create blog posts'
//       });
//     }

//     const blogData = {
//       title,
//       excerpt,
//       content,
//       categories: Array.isArray(categories) ? categories : [categories],
//       tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
//       author: req.user._id,
//       status: status || 'draft',
//       featured: featured === 'true'
//     };

//     if (metaTitle) blogData.metaTitle = metaTitle;
//     if (metaDescription) blogData.metaDescription = metaDescription;
//     if (keywords) blogData.keywords = Array.isArray(keywords) ? keywords : keywords.split(',').map(kw => kw.trim());

//     // Handle featured image upload
//     if (req.file) {
//       const uploadResult = await uploadToCloudinary(req.file, 'blog-images');
//       blogData.featuredImage = {
//         url: uploadResult.secure_url,
//         alt: title,
//         caption: req.body.imageCaption || ''
//       };
//     }

//     const blog = await Blog.create(blogData);

//     // Populate author info
//     await blog.populate('author', 'username email profilePicture');

//     res.status(201).json({
//       success: true,
//       message: 'Blog post created successfully',
//       data: blog
//     });
//   } catch (error) {
//     console.error('Create blog error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create blog post',
//       error: error.message
//     });
//   }
// };

// // Get all blog posts with filtering and pagination
// exports.getAllBlogs = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       status = 'published',
//       category,
//       tag,
//       author,
//       featured,
//       search,
//       sortBy = 'publishedAt',
//       sortOrder = 'desc'
//     } = req.query;

//     const query = { status };
    
//     // Filter by category
//     if (category) {
//       query.categories = { $in: [category] };
//     }
    
//     // Filter by tag
//     if (tag) {
//       query.tags = { $in: [tag] };
//     }
    
//     // Filter by author
//     if (author) {
//       query.author = author;
//     }
    
//     // Filter by featured
//     if (featured !== undefined) {
//       query.featured = featured === 'true';
//     }
    
//     // Search functionality
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { excerpt: { $regex: search, $options: 'i' } },
//         { content: { $regex: search, $options: 'i' } },
//         { tags: { $in: [new RegExp(search, 'i')] } }
//       ];
//     }

//     const sortOptions = {};
//     sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

//     const blogs = await Blog.find(query)
//       .populate('author', 'username profilePicture')
//       .sort(sortOptions)
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .select('-content'); // Don't send full content in list

//     const total = await Blog.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       count: blogs.length,
//       total,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(total / limit),
//       data: blogs
//     });
//   } catch (error) {
//     console.error('Get blogs error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch blog posts',
//       error: error.message
//     });
//   }
// };

// // Get single blog post by slug
// exports.getBlogBySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;
    
//     const blog = await Blog.findOne({ slug, status: 'published' })
//       .populate('author', 'username profilePicture bio')
//       .populate('comments.user', 'username profilePicture')
//       .populate('comments.replies.user', 'username profilePicture');

//     if (!blog) {
//       return res.status(404).json({
//         success: false,
//         message: 'Blog post not found'
//       });
//     }

//     // Increment view count
//     blog.views += 1;
//     await blog.save();

//     res.status(200).json({
//       success: true,
//       data: blog
//     });
//   } catch (error) {
//     console.error('Get blog error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch blog post',
//       error: error.message
//     });
//   }
// };

// // Update blog post
// exports.updateBlog = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };

//     const blog = await Blog.findById(id);
    
//     if (!blog) {
//       return res.status(404).json({
//         success: false,
//         message: 'Blog post not found'
//       });
//     }

//     // Check if user is author or admin
//     if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Unauthorized to update this blog post'
//       });
//     }

//     // Handle array fields
//     if (updateData.categories) {
//       updateData.categories = Array.isArray(updateData.categories) ? updateData.categories : [updateData.categories];
//     }
//     if (updateData.tags) {
//       updateData.tags = Array.isArray(updateData.tags) ? updateData.tags : updateData.tags.split(',').map(tag => tag.trim());
//     }
//     if (updateData.keywords) {
//       updateData.keywords = Array.isArray(updateData.keywords) ? updateData.keywords : updateData.keywords.split(',').map(kw => kw.trim());
//     }

//     // Handle featured image upload
//     if (req.file) {
//       const uploadResult = await uploadToCloudinary(req.file, 'blog-images');
//       updateData.featuredImage = {
//         url: uploadResult.secure_url,
//         alt: updateData.title || blog.title,
//         caption: updateData.imageCaption || blog.featuredImage?.caption || ''
//       };
//     }

//     const updatedBlog = await Blog.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate('author', 'username profilePicture');

//     res.status(200).json({
//       success: true,
//       message: 'Blog post updated successfully',
//       data: updatedBlog
//     });
//   } catch (error) {
//     console.error('Update blog error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update blog post',
//       error: error.message
//     });
//   }
// };

// // Delete blog post
// exports.deleteBlog = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const blog = await Blog.findById(id);
    
//     if (!blog) {
//       return res.status(404).json({
//         success: false,
//         message: 'Blog post not found'
//       });
//     }

//     // Check if user is author or admin
//     if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Unauthorized to delete this blog post'
//       });
//     }

//     await Blog.findByIdAndDelete(id);

//     res.status(200).json({
//       success: true,
//       message: 'Blog post deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete blog error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete blog post',
//       error: error.message
//     });
//   }
// };

// // Like/Unlike blog post
// exports.toggleLike = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user._id;

//     const blog = await Blog.findById(id);
    
//     if (!blog) {
//       return res.status(404).json({
//         success: false,
//         message: 'Blog post not found'
//       });
//     }

//     const hasLiked = blog.likes.includes(userId);
    
//     if (hasLiked) {
//       // Unlike
//       blog.likes = blog.likes.filter(like => like.toString() !== userId.toString());
//     } else {
//       // Like
//       blog.likes.push(userId);
//     }

//     await blog.save();

//     res.status(200).json({
//       success: true,
//       message: hasLiked ? 'Blog unliked' : 'Blog liked',
//       data: {
//         likes: blog.likes.length,
//         hasLiked: !hasLiked
//       }
//     });
//   } catch (error) {
//     console.error('Toggle like error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to toggle like',
//       error: error.message
//     });
//   }
// };

// // Add comment to blog post
// exports.addComment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { content } = req.body;

//     const blog = await Blog.findById(id);
    
//     if (!blog) {
//       return res.status(404).json({
//         success: false,
//         message: 'Blog post not found'
//       });
//     }

//     const comment = {
//       user: req.user._id,
//       content
//     };

//     blog.comments.push(comment);
//     await blog.save();

//     await blog.populate('comments.user', 'username profilePicture');

//     const newComment = blog.comments[blog.comments.length - 1];

//     res.status(201).json({
//       success: true,
//       message: 'Comment added successfully',
//       data: newComment
//     });
//   } catch (error) {
//     console.error('Add comment error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to add comment',
//       error: error.message
//     });
//   }
// };

// // Get blog statistics
// exports.getBlogStats = async (req, res) => {
//   try {
//     const totalBlogs = await Blog.countDocuments({ status: 'published' });
//     const totalViews = await Blog.aggregate([
//       { $match: { status: 'published' } },
//       { $group: { _id: null, totalViews: { $sum: '$views' } } }
//     ]);
//     const topBlogs = await Blog.find({ status: 'published' })
//       .sort({ views: -1 })
//       .limit(5)
//       .select('title slug views');

//     res.status(200).json({
//       success: true,
//       data: {
//         totalBlogs,
//         totalViews: totalViews[0]?.totalViews || 0,
//         topBlogs
//       }
//     });
//   } catch (error) {
//     console.error('Get blog stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch blog statistics',
//       error: error.message
//     });
//   }
// };



// // 





















































// // controllers/BlogController.js
// const Blog = require('../Model/BlogModel');
// const User = require('../Model/UserModel');
// const fs = require('fs');
// const path = require('path');

// // Create new blog post
// exports.createBlog = async (req, res) => {
//   let uploadedFile = null;
  
//   try {
//     const { title, excerpt, content, categories, tags, metaTitle, metaDescription, keywords, status, featured } = req.body;
    
//     // Check if user is authorized to create blog posts
//     if (!req.user.role || !['admin', 'recruiter', 'blogger'].includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Unauthorized to create blog posts'
//       });
//     }

//     const blogData = {
//       title,
//       excerpt,
//       content,
//       categories: Array.isArray(categories) ? categories : [categories],
//       tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
//       author: req.user._id,
//       status: status || 'draft',
//       featured: featured === 'true'
//     };

//     if (metaTitle) blogData.metaTitle = metaTitle;
//     if (metaDescription) blogData.metaDescription = metaDescription;
//     if (keywords) blogData.keywords = Array.isArray(keywords) ? keywords : keywords.split(',').map(kw => kw.trim());

//     // Handle featured image upload (local storage)
//     if (req.file) {
//       uploadedFile = req.file;
//       blogData.featuredImage = {
//         url: `/uploads/${req.file.filename}`,
//         filePath: req.file.path,
//         alt: title,
//         caption: req.body.imageCaption || '',
//         size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB'
//       };
//     }

//     const blog = await Blog.create(blogData);

//     // Populate author info
//     await blog.populate('author', 'username email profilePicture');

//     res.status(201).json({
//       success: true,
//       message: 'Blog post created successfully',
//       data: blog
//     });
//   } catch (error) {
//     console.error('Create blog error:', error);
    
//     // Clean up uploaded file if there was an error
//     if (uploadedFile && fs.existsSync(uploadedFile.path)) {
//       fs.unlinkSync(uploadedFile.path);
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create blog post',
//       error: error.message
//     });
//   }
// };


// // Update blog post
// exports.updateBlog = async (req, res) => {
//   let uploadedFile = null;
  
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };

//     const blog = await Blog.findById(id);
    
//     if (!blog) {
//       return res.status(404).json({
//         success: false,
//         message: 'Blog post not found'
//       });
//     }

//     // Check if user is author or admin
//     if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Unauthorized to update this blog post'
//       });
//     }

//     // Handle array fields
//     if (updateData.categories) {
//       updateData.categories = Array.isArray(updateData.categories) ? updateData.categories : [updateData.categories];
//     }
//     if (updateData.tags) {
//       updateData.tags = Array.isArray(updateData.tags) ? updateData.tags : updateData.tags.split(',').map(tag => tag.trim());
//     }
//     if (updateData.keywords) {
//       updateData.keywords = Array.isArray(updateData.keywords) ? updateData.keywords : updateData.keywords.split(',').map(kw => kw.trim());
//     }

//     // Handle featured image upload (local storage)
//     if (req.file) {
//       uploadedFile = req.file;
//       updateData.featuredImage = {
//         url: `/uploads/${req.file.filename}`,
//         filePath: req.file.path,
//         alt: updateData.title || blog.title,
//         caption: updateData.imageCaption || blog.featuredImage?.caption || '',
//         size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB'
//       };

//       // Delete old featured image if it exists
//       if (blog.featuredImage && blog.featuredImage.filePath && fs.existsSync(blog.featuredImage.filePath)) {
//         fs.unlinkSync(blog.featuredImage.filePath);
//       }
//     }

//     const updatedBlog = await Blog.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate('author', 'username profilePicture');

//     res.status(200).json({
//       success: true,
//       message: 'Blog post updated successfully',
//       data: updatedBlog
//     });
//   } catch (error) {
//     console.error('Update blog error:', error);
    
//     // Clean up uploaded file if there was an error
//     if (uploadedFile && fs.existsSync(uploadedFile.path)) {
//       fs.unlinkSync(uploadedFile.path);
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update blog post',
//       error: error.message
//     });
//   }
// };