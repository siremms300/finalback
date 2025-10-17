// models/BlogModel.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
//   content: {
//     type: String,
//     required: [true, 'Blog content is required'],
//     minlength: [100, 'Content must be at least 100 characters']
//   },

  content: {
    type: String,
    required: [true, 'Blog content is required'],
    validate: {
      validator: function(content) {
        // Strip HTML tags and check text length
        const textContent = content.replace(/<[^>]*>/g, '');
        return textContent.length >= 100;
      },
      message: 'Content must be at least 100 characters (excluding HTML tags)'
    }
  },
  featuredImage: {
    url: String,        // e.g., "/uploads/filename.jpg"
    filePath: String,   // e.g., "uploads/filename.jpg" 
    alt: String,
    caption: String,
    size: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
//   categories: [{
//     type: String,
//     required: true
//   }], 
    categories: [{
        type: String,
        required: false, // Make it not required
        default: 'General' // Or remove required and add default
    }],
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: Number, // in minutes
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: [500, 'Reply cannot exceed 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  publishedAt: Date
}, {
  timestamps: true
});

// Generate slug from title before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  }
  
  // Calculate read time (assuming 200 words per minute)
  if (this.isModified('content')) {
    const words = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(words / 200);
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Index for better query performance
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ categories: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('Blog', blogSchema);