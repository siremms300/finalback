 

const VisitorRegistration = require('../Model/VisitorModel');
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

module.exports.visitorRegister = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, preferredCourse, preferredCountry } = req.body;

    // Save registration to database
    const registration = await VisitorRegistration.create({
      fullName,
      email,
      phoneNumber,
      preferredCourse,
      preferredCountry
    });










// /////////////////@@@@@@@@@@@@@@@@@@@@@@@  EMAIL SENDING FEATURE @@@@@@@@@@@@@@@@@ ////////////




    // Send confirmation email to attendee
    // const attendeeMailOptions = {
    //   from: `"SCOVERS Webinars" <info@scovers.org>`,
    //   to: email,
    //   subject: 'Webinar Registration Confirmation',
    //   html: `
    //     <h2>Thank you for registering!</h2>
    //     <p>Dear ${fullName},</p>
    //     <p>Your registration for our webinar has been received.</p>
    //     <p>We'll send you the joining details closer to the event date.</p>
    //     <p>Regards,<br/>SCOVERS Team</p>
    //   `
    // };

    // // Send notification email to SCOVERS
    // const scoversMailOptions = {
    //   from: `"SCOVERS Webinar System" <info@scovers.org>`,
    //   to: 'info@scovers.org',
    //   subject: 'New Webinar Registration',
    //   html: `
    //     <h2>New Webinar Registration</h2>
    //     <p><strong>Name:</strong> ${fullName}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Phone:</strong> ${phoneNumber}</p>
    //     <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
    //     <p><strong>Webinar ID:</strong> ${webinarId}</p>
    //     <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
    //   `
    // };



    // const attendeeMailOptions = {
    //     from: `"SCOVERS Webinars" <info@scovers.org>`,
    //     to: email,
    //     subject: 'Webinar Registration Confirmation',
    //     html: `
    //     <!DOCTYPE html>
    //     <html>
    //     <head>
    //       <style>
    //         body {
    //           font-family: 'Arial', sans-serif;
    //           line-height: 1.6;
    //           color: #333333;
    //           max-width: 600px;
    //           margin: 0 auto;
    //           padding: 20px;
    //         }
    //         .header {
    //           background-color: #2D8CD4;
    //           padding: 30px 20px;
    //           text-align: center;
    //           border-radius: 8px 8px 0 0;
    //         }
    //         .header h1 {
    //           color: white;
    //           margin: 0;
    //           font-size: 24px;
    //         }
    //         .content {
    //           padding: 30px 20px;
    //           background-color: #f9f9f9;
    //           border-radius: 0 0 8px 8px;
    //         }
    //         .button {
    //           display: inline-block;
    //           padding: 12px 25px;
    //           background-color: #2D8CD4;
    //           color: white !important;
    //           text-decoration: none;
    //           border-radius: 4px;
    //           font-weight: bold;
    //           margin: 20px 0;
    //         }
    //         .footer {
    //           margin-top: 30px;
    //           padding-top: 20px;
    //           border-top: 1px solid #eeeeee;
    //           font-size: 12px;
    //           color: #777777;
    //           text-align: center;
    //         }
    //         .highlight-box {
    //           background-color: #e6f2ff;
    //           border-left: 4px solid #2D8CD4;
    //           padding: 15px;
    //           margin: 20px 0;
    //         }
    //       </style>
    //     </head>
    //     <body>
    //       <div class="header">
    //         <h1>Thank You for Registering!</h1>
    //       </div>
          
    //       <div class="content">
    //         <p>Dear ${fullName},</p>
            
    //         <p>We're excited to have you join our upcoming webinar. Your registration has been confirmed!</p>
            
    //         <div class="highlight-box">
    //           <p><strong>What's next?</strong></p>
    //           <p>We'll send you the webinar joining instructions and calendar invite 24 hours before the event.</p>
    //           <p>In the meantime, feel free to explore our <a href="https://scovers.org/resources" style="color: #2D8CD4;">learning resources</a>.</p>
    //         </div>
            
    //         <p>If you have any questions, simply reply to this email or contact us at info@scovers.org.</p>
            
    //         <p>Best regards,<br>
    //         <strong>The SCOVERS Team</strong></p>
            
    //         <div class="footer">
    //           <p>SCOVERS | Building the Future of Education</p>
    //           <p><a href="https://scovers.org" style="color: #2D8CD4;">www.scovers.org</a></p>
    //         </div>
    //       </div>
    //     </body>
    //     </html>
    //     `
    //   };



    //   const scoversMailOptions = {
    //     from: `"SCOVERS Webinar System" <info@scovers.org>`,
    //     to: 'info@scovers.org',
    //     subject: `New Registration: ${fullName} for Webinar`,
    //     html: `
    //     <!DOCTYPE html>
    //     <html>
    //     <head>
    //       <style>
    //         body {
    //           font-family: 'Arial', sans-serif;
    //           line-height: 1.6;
    //           color: #333333;
    //           max-width: 600px;
    //           margin: 0 auto;
    //           padding: 20px;
    //         }
    //         .header {
    //           background-color: #2D8CD4;
    //           padding: 20px;
    //           text-align: center;
    //           border-radius: 8px 8px 0 0;
    //         }
    //         .header h1 {
    //           color: white;
    //           margin: 0;
    //           font-size: 20px;
    //         }
    //         .content {
    //           padding: 25px;
    //           background-color: #f9f9f9;
    //           border-radius: 0 0 8px 8px;
    //         }
    //         .registration-details {
    //           background-color: white;
    //           border: 1px solid #dddddd;
    //           border-radius: 4px;
    //           padding: 15px;
    //           margin: 15px 0;
    //         }
    //         .detail-row {
    //           display: flex;
    //           margin-bottom: 8px;
    //         }
    //         .detail-label {
    //           font-weight: bold;
    //           width: 120px;
    //           color: #2D8CD4;
    //         }
    //         .footer {
    //           margin-top: 20px;
    //           padding-top: 15px;
    //           border-top: 1px solid #eeeeee;
    //           font-size: 12px;
    //           color: #777777;
    //           text-align: center;
    //         }
    //         .action-button {
    //           display: inline-block;
    //           background-color: #2D8CD4;
    //           color: white !important;
    //           padding: 8px 15px;
    //           text-decoration: none;
    //           border-radius: 4px;
    //           margin-top: 15px;
    //         }
    //       </style>
    //     </head>
    //     <body>
    //       <div class="header">
    //         <h1>New Webinar Registration</h1>
    //       </div>
          
    //       <div class="content">
    //         <p>You have a new registration for your upcoming webinar:</p>
            
    //         <div class="registration-details">
    //           <div class="detail-row">
    //             <span class="detail-label">Name:</span>
    //             <span>${fullName}</span>
    //           </div>
    //           <div class="detail-row">
    //             <span class="detail-label">Email:</span>
    //             <span><a href="mailto:${email}" style="color: #2D8CD4;">${email}</a></span>
    //           </div>
    //           <div class="detail-row">
    //             <span class="detail-label">Phone:</span>
    //             <span>${phoneNumber}</span>
    //           </div>
    //           <div class="detail-row">
    //             <span class="detail-label">Organization:</span>
    //             <span>${preferredCourse || 'Not provided'}</span>
    //           </div>
    //           <div class="detail-row">
    //             <span class="detail-label">Webinar ID:</span>
    //             <span>${preferredCountry}</span>
    //           </div>
    //           <div class="detail-row">
    //             <span class="detail-label">Registered At:</span>
    //             <span>${new Date().toLocaleString()}</span>
    //           </div>
    //         </div>
            
            
    //         <div class="footer">
    //           <p>SCOVERS Webinar Management System</p>
    //           <p>This is an automated notification. Do not reply to this email.</p>
    //         </div>
    //       </div>
    //     </body>
    //     </html>
    //     `
    //   };






    // // Send both emails
    // await Promise.all([
    //   transporter.sendMail(attendeeMailOptions),
    //   transporter.sendMail(scoversMailOptions)
    // ]);



    // ///////////////////////@@@@@@@@ EMAIL SENDING FEATURE END /////////// @@@@@@@@@@@





    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: registration
    }); 
  } catch (error) {
    console.error('visitor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};




module.exports.getVisitorRegistrations = async (req, res) => {
    try {
      const registrations = await VisitorRegistration.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        count: registrations.length,
        data: registrations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch SAT registrations',
        error: error.message
      });
    }
  };








// //////////////// WE WILL PUT THIS FEATURE WHEN ITS TIME
// <a href="https://admin.scovers.org/webinars/${webinarId}/registrations" class="action-button">
//   View All Registrations
// </a>