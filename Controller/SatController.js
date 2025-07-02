const SATRegistration = require('../Model/SatModel');
const nodemailer = require('nodemailer');

// Configure Titan Email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 587,
  secure: false,
  auth: {
    user: "info@scovers.org",
    pass: "Scoversedu1@"
  }
});

module.exports.registerForSAT = async (req, res) => {
  try {
    const {
      fullName,
      dob,
      email,
      phoneNumber,
      currentClass,
      currentGPA,
      isStraightAStudent,
      interestInStudyingAbroad,
      sponsorAvailability,
      referralSource,
      referrerName,
      referrerPhone,
      referrerEmail,
      parentConsent
    } = req.body;

    // Prepare registration data
    const registrationData = {
      fullName,
      dob: new Date(dob),
      email,
      phoneNumber,
      currentClass,
      currentGPA,
      isStraightAStudent,
      interestInStudyingAbroad,
      sponsorAvailability,
      referralSource,
      parentConsent: parentConsent
    };

    // Only include referrer info if referral source is 'Individual Recommendation'
    if (referralSource === 'Individual Recommendation') {
      registrationData.referrerName = referrerName;
      registrationData.referrerPhone = referrerPhone;
      registrationData.referrerEmail = referrerEmail;
    }

    // Create new SAT registration
    const registration = await SATRegistration.create(registrationData);

    // Format date of birth for email
    const formattedDOB = new Date(dob).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create HTML email template
    const mailOptions = {
      from: '"Scovers Education" <info@scovers.org>',
      to: 'info@scovers.org', // Your receiving email
      subject: `New SAT Registration: ${fullName}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
              }
              .header {
                  background-color: #2D8CD4;
                  color: white;
                  padding: 20px;
                  text-align: center;
                  border-radius: 5px 5px 0 0;
              }
              .content {
                  padding: 20px;
                  background-color: #f9f9f9;
                  border-radius: 0 0 5px 5px;
              }
              .detail-row {
                  margin-bottom: 15px;
              }
              .detail-label {
                  font-weight: bold;
                  color: #2D8CD4;
              }
              .footer {
                  margin-top: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #777;
              }
              .yes {
                  color: #28a745;
                  font-weight: bold;
              }
              .no {
                  color: #dc3545;
                  font-weight: bold;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h2>New SAT Registration</h2>
          </div>
          <div class="content">
              <div class="detail-row">
                  <span class="detail-label">Full Name:</span> ${fullName}
              </div>
              <div class="detail-row">
                  <span class="detail-label">Date of Birth:</span> ${formattedDOB}
              </div>
              <div class="detail-row">
                  <span class="detail-label">Email:</span> ${email}
              </div>
              <div class="detail-row">
                  <span class="detail-label">Phone Number:</span> ${phoneNumber}
              </div>
              <div class="detail-row">
                  <span class="detail-label">Current Class:</span> ${currentClass}
              </div>
              <div class="detail-row">
                  <span class="detail-label">Current GPA:</span> ${currentGPA}
              </div>
              <div class="detail-row">
                  <span class="detail-label">Straight A Student:</span> 
                  <span class="${isStraightAStudent ? 'yes' : 'no'}">${isStraightAStudent ? 'YES' : 'NO'}</span>
              </div>
              <div class="detail-row">
                  <span class="detail-label">Interest in Studying Abroad:</span> 
                  <span class="${interestInStudyingAbroad ? 'yes' : 'no'}">${interestInStudyingAbroad ? 'YES' : 'NO'}</span>
              </div>
              <div class="detail-row">
                  <span class="detail-label">Sponsor Availability:</span> ${sponsorAvailability === 'none' ? 'No sponsor' : '$' + sponsorAvailability.replace('-', ' - $')}
              </div>
              <div class="detail-row">
                  <span class="detail-label">Referral Source:</span> ${referralSource}
              </div>
              ${referralSource === 'Individual Recommendation' ? `
              <div class="detail-row">
                  <span class="detail-label">Referrer Name:</span> ${referrerName}
              </div>
              <div class="detail-row">
                  <span class="detail-label">Referrer Phone:</span> ${referrerPhone}
              </div>
              <div class="detail-row">
                  <span class="detail-label">Referrer Email:</span> ${referrerEmail}
              </div>
              ` : ''}
              <div class="detail-row">
                  <span class="detail-label">Parent Consent:</span> 
                  <span class="${parentConsent ? 'yes' : 'no'}">${parentConsent ? 'YES' : 'NO'}</span>
              </div>
          </div>
          <div class="footer">
              <p>This email was automatically generated by Scovers Education SAT registration system.</p>
              <p>Registration received at: ${new Date().toLocaleString()}</p>
          </div>
      </body>
      </html>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Check scholarship eligibility but don't block registration
    let scholarshipEligible = true;
    let scholarshipMessage = 'You may be eligible for scholarships';
    
    if (currentGPA < 4.0 && sponsorAvailability === 'none') {
      scholarshipEligible = false;
      scholarshipMessage = 'Note: Scholarship not available for GPA below 4.0 without sponsor, but you can still take the SAT';
    } else if (currentGPA < 0) {
      scholarshipEligible = false;
      scholarshipMessage = 'Note: Invalid GPA entered, please contact support for scholarship information';
    }

    res.status(201).json({
      success: true,
      message: 'SAT registration successful',
      scholarshipEligible,
      scholarshipMessage,
      data: registration
    });

  } catch (error) {
    console.error('SAT registration error:', error);
    res.status(500).json({
      success: false,
      message: 'SAT registration failed',
      error: error.message
    });
  }
};

module.exports.getSATRegistrations = async (req, res) => {
  try {
    const registrations = await SATRegistration.find().sort({ createdAt: -1 });
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


















// const SATRegistration = require('../Model/SatModel');

// module.exports.registerForSAT = async (req, res) => {
//   try {
//     const {
//       fullName,
//       dob,
//       email,
//       phoneNumber,
//       currentClass,
//       currentGPA,
//       isStraightAStudent,
//       interestInStudyingAbroad,
//       sponsorAvailability,
//       referralSource,
//       referrerName,
//       referrerPhone,
//       referrerEmail,
//       parentConsent
//     } = req.body;

//     // Prepare registration data
//     const registrationData = {
//       fullName,
//       dob: new Date(dob),
//       email,
//       phoneNumber,
//       currentClass,
//       currentGPA,
//       isStraightAStudent,
//       interestInStudyingAbroad,
//       sponsorAvailability,
//       referralSource,
//       parentConsent: parentConsent
//     };

//     // Only include referrer info if referral source is 'Individual Recommendation'
//     if (referralSource === 'Individual Recommendation') {
//       registrationData.referrerName = referrerName;
//       registrationData.referrerPhone = referrerPhone;
//       registrationData.referrerEmail = referrerEmail;
//     }

//     // Create new SAT registration
//     const registration = await SATRegistration.create(registrationData);

//     // Check scholarship eligibility but don't block registration
//     let scholarshipEligible = true;
//     let scholarshipMessage = 'You may be eligible for scholarships';
    
//     if (currentGPA < 4.0 && sponsorAvailability === 'none') {
//       scholarshipEligible = false;
//       scholarshipMessage = 'Note: Scholarship not available for GPA below 4.0 without sponsor, but you can still take the SAT';
//     } else if (currentGPA < 0) {
//       scholarshipEligible = false;
//       scholarshipMessage = 'Note: Invalid GPA entered, please contact support for scholarship information';
//     }

//     res.status(201).json({
//       success: true,
//       message: 'SAT registration successful',
//       scholarshipEligible,
//       scholarshipMessage,
//       data: registration
//     });

//   } catch (error) {
//     console.error('SAT registration error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'SAT registration failed',
//       error: error.message
//     });
//   }
// };

// module.exports.getSATRegistrations = async (req, res) => {
//   try {
//     const registrations = await SATRegistration.find().sort({ createdAt: -1 });
//     res.status(200).json({
//       success: true,
//       count: registrations.length,
//       data: registrations
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch SAT registrations',
//       error: error.message
//     });
//   }
// };