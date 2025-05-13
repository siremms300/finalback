const WebinarRegistration = require('../Model/WebinarModel');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
 

 
// Configure Titan Email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 587,
  secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.TITAN_EMAIL_USER,
//     pass: process.env.TITAN_EMAIL_PASSWORD
//   }
  auth: {
    user: "info@scovers.org", // Your Titan email
    pass: "Scoversedu1@", // Your Titan email password
},
});

module.exports.registerForWebinar = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, preferredCourse, preferredCountry } = req.body;

    // Save registration to database
    const registration = await WebinarRegistration.create({
      fullName,
      email,
      phoneNumber,
      preferredCourse,
      preferredCountry
    });

    


    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: registration
    }); 
  } catch (error) {
    console.error('Webinar registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};





module.exports.getWebinarRegistrations = async (req, res) => {
  try {
    const registrations = await WebinarRegistration.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Webinar registrations',
      error: error.message
    });
  }
};









// //////////////// WE WILL PUT THIS FEATURE WHEN ITS TIME
// <a href="https://admin.scovers.org/webinars/${webinarId}/registrations" class="action-button">
//   View All Registrations
// </a>