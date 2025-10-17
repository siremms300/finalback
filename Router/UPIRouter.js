// const express = require('express');
// const UPIRouter = express.Router();
// const UPIController = require('../controllers/UPIController');
// const multer = require('multer');
// const path = require('path');

const express = require('express');
const UPIRouter = express.Router();
const UPIController = require("../Controller/UPIController");
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'image/jpeg' || 
      file.mimetype === 'image/png' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and Word documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// UPI application routes
UPIRouter.post('/register', upload.array('documents', 10), UPIController.registerForUPI); 
UPIRouter.get('/applications', UPIController.getUPIRegistrations);
UPIRouter.get('/applications/:id', UPIController.getUPIApplication);
UPIRouter.patch('/applications/:id/status', UPIController.updateApplicationStatus);
UPIRouter.get('/applications/stats', UPIController.getApplicationStats);
UPIRouter.delete('/applications/:id', UPIController.deleteApplication);


// Add this to your UPIRouter.js
UPIRouter.get('/test-email', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.titan.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.TITAN_EMAIL_USER || "info@scovers.org",
        pass: process.env.TITAN_EMAIL_PASSWORD || "Scoversedu1@"
      }
    });

    await transporter.verify();
    
    const testMailOptions = {
      from: '"Scovers Test" <info@scovers.org>',
      to: 'info@scovers.org',
      subject: 'Test Email from Scovers UPI System',
      text: 'This is a test email to verify email configuration.'
    };

    const result = await transporter.sendMail(testMailOptions);
    
    res.json({
      success: true,
      message: 'Email configuration test successful',
      result: result
    });
  } catch (error) {
    console.error('Email test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email configuration test failed',
      error: error.message
    });
  }
});

module.exports = UPIRouter;





















// const express = require('express');
// const UPIRouter = express.Router();
// const UPIController = require("../Controller/UPIController");
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
//     fileSize: 20 * 1024 * 1024 // 10MB limit
//   }
// });

// // UPI application routes
// UPIRouter.post('/register', upload.array('documents', 10), UPIController.registerForUPI);
// UPIRouter.get('/applications', UPIController.getUPIRegistrations);
// UPIRouter.get('/applications/:id', UPIController.getUPIApplication);
// UPIRouter.patch('/applications/:id/status', UPIController.updateApplicationStatus);

// module.exports = UPIRouter;