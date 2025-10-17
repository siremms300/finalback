const UPIRegistration = require('../Model/UPIModel');
const nodemailer = require('nodemailer');
const fs = require('fs');

// // Configure Email transporter
// const transporter = nodemailer.createTransport({
//   host: 'smtp.titan.email',
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.TITAN_EMAIL_USER || "info@scovers.org",
//     pass: process.env.TITAN_EMAIL_PASSWORD || "Scoversedu1@"
//   }
// });

// module.exports.registerForUPI = async (req, res) => {
//   try {
//     console.log('Received UPI application:', req.body);
//     console.log('Uploaded files:', req.files);

//     const {
//       // Personal Info
//       fullName, dateOfBirth, nationality, email, phoneNumber, address,
//       // Academic Info
//       currentSchool, academicLevel, intendedMajor, targetCountries,
//       // Essay
//       motivationEssay,
//       // Financial
//       financialReadiness,
//       // Parental (if applicable)
//       parentName, parentEmail, parentPhone, isMinor
//     } = req.body;

//     // Handle targetCountries - it could be string or array
//     let countriesArray = [];
//     if (Array.isArray(targetCountries)) {
//       countriesArray = targetCountries;
//     } else if (typeof targetCountries === 'string') {
//       countriesArray = [targetCountries];
//     } else if (targetCountries) {
//       try {
//         countriesArray = JSON.parse(targetCountries);
//       } catch (e) {
//         countriesArray = [targetCountries];
//       }
//     }

//     // Handle file uploads
//     const documents = [];
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         documents.push({
//           name: file.originalname,
//           fileUrl: `/uploads/${file.filename}`,
//           filePath: file.path,
//           size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
//         });
//       }
//     }

//     // Prepare parental consent data
//     let parentalConsent = {};
//     if (isMinor === 'true') {
//       parentalConsent = {
//         parentName: parentName || '',
//         parentEmail: parentEmail || '',
//         parentPhone: parentPhone || '',
//         consentGiven: true,
//         consentedAt: new Date()
//       };
//     }

//     // Validate required fields
//     if (!fullName || !email || !phoneNumber || !currentSchool || !academicLevel || !intendedMajor) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields'
//       });
//     }

//     // Save registration to database
//     const registration = await UPIRegistration.create({
//       fullName,
//       dateOfBirth: dateOfBirth || null,
//       nationality: nationality || '',
//       email,
//       phoneNumber,
//       address: address || '',
//       currentSchool,
//       academicLevel,
//       intendedMajor,
//       targetCountries: countriesArray,
//       motivationEssay: motivationEssay || '',
//       financialReadiness: financialReadiness || 'within_30_days',
//       parentalConsent,
//       documents
//     });

//     // Format financial readiness for display
//     const financialLabels = {
//       'within_7_days': 'Within 7 days',
//       'within_14_days': 'Within 14 days',
//       'within_30_days': 'Within 30 days',
//       'need_financial_aid': 'Needs financial assistance'
//     };

//     // Send comprehensive notification email to company
//     const companyMailOptions = {
//       from: '"Scovers UPI System" <info@scovers.org>',
//       to: 'info@scovers.org', // Your company email
//       subject: `🚀 NEW UPI APPLICATION: ${fullName}`,
//       html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//           <style>
//               body { 
//                   font-family: 'Arial', sans-serif; 
//                   line-height: 1.6; 
//                   color: #333; 
//                   max-width: 800px; 
//                   margin: 0 auto; 
//                   padding: 20px;
//                   background-color: #f4f4f4;
//               }
//               .header { 
//                   background: linear-gradient(135deg, #2D8CD4, #1A5F8B); 
//                   color: white; 
//                   padding: 30px; 
//                   text-align: center; 
//                   border-radius: 10px 10px 0 0;
//                   margin-bottom: 0;
//               }
//               .content { 
//                   padding: 30px; 
//                   background: white;
//                   border-radius: 0 0 10px 10px;
//                   box-shadow: 0 2px 10px rgba(0,0,0,0.1);
//               }
//               .section { 
//                   margin: 25px 0;
//                   padding: 20px;
//                   border-left: 4px solid #2D8CD4;
//                   background: #f8f9fa;
//                   border-radius: 5px;
//               }
//               .section-title {
//                   color: #2D8CD4;
//                   font-size: 18px;
//                   font-weight: bold;
//                   margin-bottom: 15px;
//                   border-bottom: 2px solid #e9ecef;
//                   padding-bottom: 8px;
//               }
//               .detail-grid {
//                   display: grid;
//                   grid-template-columns: 1fr 1fr;
//                   gap: 15px;
//               }
//               .detail-item {
//                   margin-bottom: 10px;
//               }
//               .detail-label {
//                   font-weight: bold;
//                   color: #495057;
//                   display: block;
//                   margin-bottom: 3px;
//               }
//               .detail-value {
//                   color: #212529;
//                   background: white;
//                   padding: 8px 12px;
//                   border-radius: 4px;
//                   border: 1px solid #dee2e6;
//               }
//               .urgent {
//                   background: #fff3cd;
//                   border: 1px solid #ffeaa7;
//                   padding: 15px;
//                   border-radius: 5px;
//                   margin: 15px 0;
//               }
//               .documents-list {
//                   background: white;
//                   padding: 15px;
//                   border-radius: 5px;
//                   border: 1px solid #dee2e6;
//               }
//               .document-item {
//                   padding: 8px;
//                   border-bottom: 1px solid #e9ecef;
//                   display: flex;
//                   justify-content: space-between;
//               }
//               .document-item:last-child {
//                   border-bottom: none;
//               }
//               .footer {
//                   text-align: center;
//                   margin-top: 30px;
//                   padding: 20px;
//                   background: #e9ecef;
//                   border-radius: 5px;
//                   font-size: 12px;
//                   color: #6c757d;
//               }
//               .action-buttons {
//                   text-align: center;
//                   margin: 25px 0;
//               }
//               .action-button {
//                   display: inline-block;
//                   background: #28a745;
//                   color: white;
//                   padding: 12px 25px;
//                   text-decoration: none;
//                   border-radius: 5px;
//                   margin: 0 10px;
//                   font-weight: bold;
//               }
//               .timestamp {
//                   text-align: center;
//                   color: #6c757d;
//                   font-style: italic;
//                   margin: 15px 0;
//               }
//           </style>
//       </head>
//       <body>
//           <div class="header">
//               <h1>🎓 New UPI Application Received</h1>
//               <p>Application ID: ${registration._id}</p>
//           </div>
          
//           <div class="content">
//               <div class="timestamp">
//                   Submitted on: ${new Date().toLocaleString('en-US', { 
//                       weekday: 'long', 
//                       year: 'numeric', 
//                       month: 'long', 
//                       day: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit'
//                   })}
//               </div>

//               <!-- Applicant Summary -->
//               <div class="section">
//                   <div class="section-title">👤 Applicant Summary</div>
//                   <div class="detail-grid">
//                       <div class="detail-item">
//                           <span class="detail-label">Full Name:</span>
//                           <div class="detail-value">${fullName}</div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Email:</span>
//                           <div class="detail-value">${email}</div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Phone:</span>
//                           <div class="detail-value">${phoneNumber}</div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Date of Birth:</span>
//                           <div class="detail-value">${dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : 'Not provided'}</div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Nationality:</span>
//                           <div class="detail-value">${nationality || 'Not provided'}</div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Under 18:</span>
//                           <div class="detail-value">${isMinor === 'true' ? 'Yes' : 'No'}</div>
//                       </div>
//                   </div>
//               </div>

//               <!-- Academic Information -->
//               <div class="section">
//                   <div class="section-title">📚 Academic Information</div>
//                   <div class="detail-grid">
//                       <div class="detail-item">
//                           <span class="detail-label">Current School:</span>
//                           <div class="detail-value">${currentSchool}</div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Academic Level:</span>
//                           <div class="detail-value">${academicLevel}</div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Intended Major:</span>
//                           <div class="detail-value">${intendedMajor}</div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Target Countries:</span>
//                           <div class="detail-value">${countriesArray.join(', ') || 'Not specified'}</div>
//                       </div>
//                   </div>
//               </div>

//               <!-- Financial Information -->
//               <div class="section">
//                   <div class="section-title">💰 Financial Readiness</div>
//                   <div class="detail-item">
//                       <span class="detail-label">Payment Timeline:</span>
//                       <div class="detail-value" style="background: ${financialReadiness === 'need_financial_aid' ? '#fff3cd' : '#d4edda'};">
//                           <strong>${financialLabels[financialReadiness] || 'Not specified'}</strong>
//                       </div>
//                   </div>
//                   ${financialReadiness === 'need_financial_aid' ? `
//                   <div class="urgent">
//                       <strong>⚠️ Attention:</strong> This applicant requires financial assistance. Please follow up regarding scholarship options.
//                   </div>
//                   ` : ''}
//               </div>

//               <!-- Parental Information (if applicable) -->
//               ${isMinor === 'true' ? `
//               <div class="section">
//                   <div class="section-title">👨‍👩‍👧‍👦 Parent/Guardian Information</div>
//                   <div class="detail-grid">
//                       <div class="detail-item">
//                           <span class="detail-label">Parent Name:</span>
//                           <div class="detail-value">${parentName || 'Not provided'}</div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Parent Email:</span>
//                           <div class="detail-value">${parentEmail || 'Not provided'}</div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Parent Phone:</span>
//                           <div class="detail-value">${parentPhone || 'Not provided'}</div>
//                       </div>
//                   </div>
//               </div>
//               ` : ''}

//               <!-- Motivation Essay -->
//               <div class="section">
//                   <div class="section-title">📝 Motivation Essay</div>
//                   <div class="detail-item">
//                       <div class="detail-value" style="white-space: pre-wrap; min-height: 100px; max-height: 300px; overflow-y: auto;">
//                           ${motivationEssay || 'No essay provided'}
//                       </div>
//                   </div>
//                   <div style="text-align: right; margin-top: 8px; font-size: 12px; color: #6c757d;">
//                       Character count: ${motivationEssay ? motivationEssay.length : 0}
//                   </div>
//               </div>

//               <!-- Uploaded Documents -->
//               <div class="section">
//                   <div class="section-title">📎 Uploaded Documents</div>
//                   ${documents.length > 0 ? `
//                   <div class="documents-list">
//                       ${documents.map(doc => `
//                       <div class="document-item">
//                           <span>${doc.name}</span>
//                           <span style="color: #6c757d; font-size: 12px;">${doc.size}</span>
//                       </div>
//                       `).join('')}
//                   </div>
//                   <div style="margin-top: 10px; text-align: center;">
//                       <strong>Total documents:</strong> ${documents.length} files uploaded
//                   </div>
//                   ` : `
//                   <div style="text-align: center; color: #6c757d; font-style: italic;">
//                       No documents were uploaded with this application
//                   </div>
//                   `}
//               </div>

//               <!-- Address Information -->
//               ${address ? `
//               <div class="section">
//                   <div class="section-title">🏠 Contact Address</div>
//                   <div class="detail-item">
//                       <div class="detail-value" style="white-space: pre-wrap;">${address}</div>
//                   </div>
//               </div>
//               ` : ''}

//               <!-- Action Buttons -->
//               <div class="action-buttons">
//                   <a href="mailto:${email}" class="action-button" style="background: #2D8CD4;">
//                       📧 Email Applicant
//                   </a>
//                   <a href="tel:${phoneNumber}" class="action-button" style="background: #28a745;">
//                       📞 Call Applicant
//                   </a>
//               </div>

//               <!-- Application Statistics -->
//               <div class="section">
//                   <div class="section-title">📊 Application Metrics</div>
//                   <div class="detail-grid">
//                       <div class="detail-item">
//                           <span class="detail-label">Application ID:</span>
//                           <div class="detail-value"><code>${registration._id}</code></div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Submission Time:</span>
//                           <div class="detail-value">${new Date().toLocaleTimeString()}</div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Essay Length:</span>
//                           <div class="detail-value">${motivationEssay ? motivationEssay.length : 0} characters</div>
//                       </div>
//                       <div class="detail-item">
//                           <span class="detail-label">Documents Uploaded:</span>
//                           <div class="detail-value">${documents.length} files</div>
//                       </div>
//                   </div>
//               </div>

//               <div class="footer">
//                   <p>This email was automatically generated by the Scovers Education UPI Application System.</p>
//                   <p>Please do not reply to this email. Contact the technical team for system issues.</p>
//               </div>
//           </div>
//       </body>
//       </html>
//       `
//     };

//     // Send confirmation email to student (existing code)
//     const studentMailOptions = {
//       from: '"Scovers Education" <info@scovers.org>',
//       to: email,
//       subject: 'UPI Application Received - Scovers Education',
//       html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//           <style>
//               body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
//               .header { background: linear-gradient(135deg, #2D8CD4, #1A5F8B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
//               .content { padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
//               .detail-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2D8CD4; }
//               .next-steps { background: #e8f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
//           </style>
//       </head>
//       <body>
//           <div class="header">
//               <h1>UPI Application Received</h1>
//               <p>Thank you for applying to our University Preparation Intensive program</p>
//           </div>
//           <div class="content">
//               <div class="detail-box">
//                   <h3>Application Details</h3>
//                   <p><strong>Application ID:</strong> ${registration._id}</p>
//                   <p><strong>Name:</strong> ${fullName}</p>
//                   <p><strong>Program:</strong> University Preparation Intensive (UPI)</p>
//                   <p><strong>Applied On:</strong> ${new Date().toLocaleDateString()}</p>
//               </div>
              
//               <div class="next-steps">
//                   <h3>Next Steps</h3>
//                   <ol>
//                       <li>Our team will review your application within 3-5 business days</li>
//                       <li>You'll receive an email with the admission decision</li>
//                       <li>If accepted, payment instructions will be provided</li>
//                       <li>Program orientation materials will be sent upon payment confirmation</li>
//                   </ol>
//               </div>
              
//               <p><strong>Contact Information:</strong></p>
//               <p>Email: info@scovers.org</p>
//               <p>Phone: [Your Company Phone Number]</p>
              
//               <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px;">
//                   <strong>Important:</strong> Please save this email for your records. Your Application ID is <strong>${registration._id}</strong>.
//               </div>
//           </div>
//       </body>
//       </html>
//       `
//     };

//     try {
//       // Send both emails
//       await Promise.all([
//         transporter.sendMail(studentMailOptions),
//         transporter.sendMail(companyMailOptions)
//       ]);
      
//       console.log('Both confirmation and notification emails sent successfully');
      
//     } catch (emailError) {
//       console.error('Email sending failed:', emailError);
//       // Don't fail the request if email fails, but log it
//     }

//     res.status(201).json({
//       success: true,
//       message: 'UPI application submitted successfully',
//       data: {
//         applicationId: registration._id,
//         nextSteps: [
//           'Application under review',
//           'Decision within 3-5 business days',
//           'Check your email for updates'
//         ]
//       }
//     });

//   } catch (error) {
//     console.error('UPI registration error:', error);
    
//     // Clean up uploaded files if there was an error
//     if (req.files && req.files.length > 0) {
//       req.files.forEach(file => {
//         if (fs.existsSync(file.path)) {
//           fs.unlinkSync(file.path);
//         }
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Application submission failed',
//       error: error.message
//     });
//   }
// };

// ... rest of your controller methods remain the same



// Configure Email transporter with better error handling




const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.titan.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || "info@scovers.org",
      pass: process.env.EMAIL_PASSWORD || "Scoversedu1@"
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

// Call this when server starts
verifyEmailConfig();

const sendEmailWithRetry = async (mailOptions, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const transporter = createTransporter();
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully (attempt ${attempt})`);
      return result;
    } catch (error) {
      console.error(`❌ Email send attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
};

module.exports.registerForUPI = async (req, res) => {
  let uploadedFiles = [];
  
  try {
    console.log('Received UPI application:', req.body);
    console.log('Uploaded files:', req.files);

    const {
      fullName, dateOfBirth, nationality, email, phoneNumber, address,
      currentSchool, academicLevel, intendedMajor, targetCountries,
      motivationEssay, financialReadiness,
      parentName, parentEmail, parentPhone, isMinor
    } = req.body;

    // Store uploaded files for cleanup
    uploadedFiles = req.files || [];

    // Handle targetCountries
    let countriesArray = [];
    if (Array.isArray(targetCountries)) {
      countriesArray = targetCountries;
    } else if (typeof targetCountries === 'string') {
      countriesArray = [targetCountries];
    } else if (targetCountries) {
      try {
        countriesArray = JSON.parse(targetCountries);
      } catch (e) {
        countriesArray = [targetCountries];
      }
    }

    // Handle file uploads
    const documents = [];
    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        documents.push({
          name: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          filePath: file.path,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
        });
      }
    }

    // Prepare parental consent data
    let parentalConsent = {};
    if (isMinor === 'true') {
      parentalConsent = {
        parentName: parentName || '',
        parentEmail: parentEmail || '',
        parentPhone: parentPhone || '',
        consentGiven: true,
        consentedAt: new Date()
      };
    }

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !currentSchool || !academicLevel || !intendedMajor) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Save registration to database
    const registration = await UPIRegistration.create({
      fullName,
      dateOfBirth: dateOfBirth || null,
      nationality: nationality || '',
      email,
      phoneNumber,
      address: address || '',
      currentSchool,
      academicLevel,
      intendedMajor,
      targetCountries: countriesArray,
      motivationEssay: motivationEssay || '',
      financialReadiness: financialReadiness || 'within_30_days',
      parentalConsent,
      documents
    });

    // Format financial readiness for display
    const financialLabels = {
      'within_7_days': 'Within 7 days',
      'within_14_days': 'Within 14 days',
      'within_30_days': 'Within 30 days',
      'need_financial_aid': 'Needs financial assistance'
    };

    // Create company email content
    const companyMailOptions = {
      from: '"Scovers UPI System" <info@scovers.org>',
      to: 'info@scovers.org', // Primary company email
      cc: 'thedenafrica@gmail.com', // Additional backup email for testing
      subject: `🎓 NEW UPI APPLICATION: ${fullName} - ${intendedMajor}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2D8CD4, #1A5F8B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .section { margin: 25px 0; padding: 20px; border-left: 4px solid #2D8CD4; background: #f8f9fa; border-radius: 5px; }
              .section-title { color: #2D8CD4; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
              .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
              .detail-item { margin-bottom: 10px; }
              .detail-label { font-weight: bold; color: #495057; display: block; margin-bottom: 3px; }
              .detail-value { color: #212529; background: white; padding: 8px 12px; border-radius: 4px; border: 1px solid #dee2e6; }
              .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
              .footer { text-align: center; margin-top: 30px; padding: 20px; background: #e9ecef; border-radius: 5px; font-size: 12px; color: #6c757d; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>🎓 New UPI Application Received</h1>
              <p>Application ID: ${registration._id}</p>
          </div>
          
          <div class="content">
              <div style="text-align: center; color: #6c757d; margin-bottom: 20px;">
                  Submitted: ${new Date().toLocaleString()}
              </div>

              <div class="section">
                  <div class="section-title">👤 Applicant Information</div>
                  <div class="detail-grid">
                      <div class="detail-item">
                          <span class="detail-label">Full Name:</span>
                          <div class="detail-value"><strong>${fullName}</strong></div>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">Email:</span>
                          <div class="detail-value">${email}</div>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">Phone:</span>
                          <div class="detail-value">${phoneNumber}</div>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">Academic Level:</span>
                          <div class="detail-value">${academicLevel}</div>
                      </div>
                  </div>
              </div>

              <div class="section">
                  <div class="section-title">📚 Academic Details</div>
                  <div class="detail-grid">
                      <div class="detail-item">
                          <span class="detail-label">Current School:</span>
                          <div class="detail-value">${currentSchool}</div>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">Intended Major:</span>
                          <div class="detail-value"><strong>${intendedMajor}</strong></div>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">Target Countries:</span>
                          <div class="detail-value">${countriesArray.join(', ')}</div>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">Financial Readiness:</span>
                          <div class="detail-value">${financialLabels[financialReadiness]}</div>
                      </div>
                  </div>
              </div>

              ${isMinor === 'true' ? `
              <div class="section">
                  <div class="section-title">👨‍👩‍👧‍👦 Parent Information</div>
                  <div class="detail-grid">
                      <div class="detail-item">
                          <span class="detail-label">Parent Name:</span>
                          <div class="detail-value">${parentName}</div>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">Parent Email:</span>
                          <div class="detail-value">${parentEmail}</div>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">Parent Phone:</span>
                          <div class="detail-value">${parentPhone}</div>
                      </div>
                  </div>
              </div>
              ` : ''}

              <div class="section">
                  <div class="section-title">📝 Motivation Essay Preview</div>
                  <div class="detail-value" style="white-space: pre-wrap; max-height: 200px; overflow-y: auto;">
                      ${motivationEssay.substring(0, 500)}${motivationEssay.length > 500 ? '...' : ''}
                  </div>
                  <div style="text-align: right; margin-top: 8px; color: #6c757d;">
                      ${motivationEssay.length} characters total
                  </div>
              </div>

              <div class="section">
                  <div class="section-title">📎 Uploaded Documents</div>
                  <div class="detail-value">
                      <strong>${documents.length} files uploaded:</strong><br>
                      ${documents.map(doc => `• ${doc.name} (${doc.size})`).join('<br>')}
                  </div>
              </div>

              <div style="text-align: center; margin: 25px 0;">
                  <a href="mailto:${email}" style="background: #2D8CD4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;">
                      📧 Email Applicant
                  </a>
                  <a href="tel:${phoneNumber}" style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;">
                      📞 Call Applicant
                  </a>
              </div>

              <div class="footer">
                  <p>This is an automated notification from Scovers Education UPI System</p>
                  <p>Application ID: ${registration._id} | Received: ${new Date().toISOString()}</p>
              </div>
          </div>
      </body>
      </html>
      `,
      // Text version for email clients that prefer plain text
      text: `
NEW UPI APPLICATION RECEIVED

Applicant: ${fullName}
Email: ${email}
Phone: ${phoneNumber}
Academic Level: ${academicLevel}
Intended Major: ${intendedMajor}
Target Countries: ${countriesArray.join(', ')}
Financial Readiness: ${financialLabels[financialReadiness]}

Current School: ${currentSchool}
${isMinor === 'true' ? `Parent: ${parentName} (${parentEmail}, ${parentPhone})` : ''}

Motivation Essay: ${motivationEssay.substring(0, 300)}...

Documents Uploaded: ${documents.length} files
${documents.map(doc => `- ${doc.name} (${doc.size})`).join('\n')}

Application ID: ${registration._id}
Submitted: ${new Date().toLocaleString()}

Please follow up with the applicant within 24 hours.
      `
    };

    // Student confirmation email
    const studentMailOptions = {
      from: '"Scovers Education" <info@scovers.org>',
      to: email,
      subject: 'UPI Application Received - Scovers Education',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2D8CD4, #1A5F8B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>UPI Application Received</h1>
              <p>Thank you for applying to our University Preparation Intensive program</p>
          </div>
          <div class="content">
              <p>Dear <strong>${fullName}</strong>,</p>
              
              <p>We have successfully received your application for the University Preparation Intensive program.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Application Summary</h3>
                  <p><strong>Application ID:</strong> ${registration._id}</p>
                  <p><strong>Program:</strong> University Preparation Intensive (UPI)</p>
                  <p><strong>Intended Major:</strong> ${intendedMajor}</p>
                  <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="background: #e8f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Next Steps</h3>
                  <ol>
                      <li>Our admissions team will review your application within 3-5 business days</li>
                      <li>You'll receive an email with the admission decision</li>
                      <li>If accepted, payment instructions will be provided</li>
                      <li>Program orientation materials will be sent upon payment confirmation</li>
                  </ol>
              </div>
              
              <p><strong>Contact Information:</strong><br>
              Email: info@scovers.org<br>
              We're here to help you with your educational journey!</p>
              
              <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                  <strong>Important:</strong> Please save this email for your records. Your Application ID is <strong>${registration._id}</strong>.
              </div>
          </div>
      </body>
      </html>
      `
    };

    // Send emails with better error handling
    let studentEmailSent = false;
    let companyEmailSent = false;

    try {
      console.log('📧 Attempting to send student confirmation email...');
      await sendEmailWithRetry(studentMailOptions);
      studentEmailSent = true;
      console.log('✅ Student confirmation email sent successfully');
    } catch (studentEmailError) {
      console.error('❌ Failed to send student email:', studentEmailError);
    }

    try {
      console.log('📧 Attempting to send company notification email...');
      await sendEmailWithRetry(companyMailOptions);
      companyEmailSent = true;
      console.log('✅ Company notification email sent successfully');
    } catch (companyEmailError) {
      console.error('❌ Failed to send company email:', companyEmailError);
    }

    // Log email status
    console.log('📊 Email sending summary:');
    console.log(`   Student email: ${studentEmailSent ? '✅ Sent' : '❌ Failed'}`);
    console.log(`   Company email: ${companyEmailSent ? '✅ Sent' : '❌ Failed'}`);

    // Respond to client
    res.status(201).json({
      success: true,
      message: 'UPI application submitted successfully',
      data: {
        applicationId: registration._id,
        emailsSent: {
          student: studentEmailSent,
          company: companyEmailSent
        },
        nextSteps: [
          'Application under review',
          'Decision within 3-5 business days',
          'Check your email for updates'
        ]
      }
    });

  } catch (error) {
    console.error('UPI registration error:', error);
    
    // Clean up uploaded files if there was an error
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Application submission failed',
      error: error.message
    });
  }
};
  

module.exports.getUPIRegistrations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    
    const registrations = await UPIRegistration.find(query)
      .sort({ registrationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UPIRegistration.countDocuments(query);

    res.status(200).json({
      success: true,
      count: registrations.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch UPI applications',
      error: error.message
    });
  }
};

module.exports.getUPIApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await UPIRegistration.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
};

module.exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await UPIRegistration.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
};






// Add to your UPIRouter.js



module.exports.getApplicationStats = async (req, res) => {
  try {
    const stats = await UPIRegistration.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statObject = {
      total: await UPIRegistration.countDocuments(),
      pending: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
      waitlisted: 0
    };
    
    stats.forEach(stat => {
      statObject[stat._id] = stat.count;
    });
    
    res.json({
      success: true,
      data: statObject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Delete application
module.exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await UPIRegistration.findByIdAndDelete(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Clean up uploaded files
    if (application.documents && application.documents.length > 0) {
      application.documents.forEach(doc => {
        if (fs.existsSync(doc.filePath)) {
          fs.unlinkSync(doc.filePath);
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message
    });
  }
};









































// const UPIRegistration = require('../Model/UPIModel');
// const nodemailer = require('nodemailer');
// const fs = require('fs');

// // Configure Email transporter
// const transporter = nodemailer.createTransport({
//   host: 'smtp.titan.email',
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER || "info@scovers.org",
//     pass: process.env.EMAIL_PASSWORD || "Scoversedu1@"
//   }
// });

// module.exports.registerForUPI = async (req, res) => {
//   try {
//     console.log('Received UPI application:', req.body);
//     console.log('Uploaded files:', req.files);

//     const {
//       // Personal Info
//       fullName, dateOfBirth, nationality, email, phoneNumber, address,
//       // Academic Info
//       currentSchool, academicLevel, intendedMajor, targetCountries,
//       // Essay
//       motivationEssay,
//       // Financial
//       financialReadiness,
//       // Parental (if applicable)
//       parentName, parentEmail, parentPhone, isMinor
//     } = req.body;

//     // Handle targetCountries - it could be string or array
//     let countriesArray = [];
//     if (Array.isArray(targetCountries)) {
//       countriesArray = targetCountries;
//     } else if (typeof targetCountries === 'string') {
//       countriesArray = [targetCountries];
//     } else if (targetCountries) {
//       countriesArray = JSON.parse(targetCountries);
//     }

//     // Handle file uploads
//     const documents = [];
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         // For now, just store file info - you can integrate Cloudinary later
//         documents.push({
//           name: file.originalname,
//           fileUrl: `/uploads/${file.filename}`,
//           filePath: file.path
//         });
//       }
//     }

//     // Prepare parental consent data
//     let parentalConsent = {};
//     if (isMinor === 'true') {
//       parentalConsent = {
//         parentName: parentName || '',
//         parentEmail: parentEmail || '',
//         parentPhone: parentPhone || '',
//         consentGiven: true,
//         consentedAt: new Date()
//       };
//     }

//     // Validate required fields
//     if (!fullName || !email || !phoneNumber || !currentSchool || !academicLevel || !intendedMajor) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields'
//       });
//     }

//     // Save registration to database
//     const registration = await UPIRegistration.create({
//       fullName,
//       dateOfBirth: dateOfBirth || null,
//       nationality: nationality || '',
//       email,
//       phoneNumber,
//       address: address || '',
//       currentSchool,
//       academicLevel,
//       intendedMajor,
//       targetCountries: countriesArray,
//       motivationEssay: motivationEssay || '',
//       financialReadiness: financialReadiness || 'within_30_days',
//       parentalConsent,
//       documents
//     });

//     // Send confirmation email to student
//     const studentMailOptions = {
//       from: '"Scovers Education" <info@scovers.org>',
//       to: email,
//       subject: 'UPI Application Received - Scovers Education',
//       html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//           <style>
//               body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
//               .header { background: linear-gradient(135deg, #2D8CD4, #1A5F8B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
//               .content { padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
//               .detail-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2D8CD4; }
//               .next-steps { background: #e8f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
//           </style>
//       </head>
//       <body>
//           <div class="header">
//               <h1>UPI Application Received</h1>
//               <p>Thank you for applying to our University Preparation Intensive program</p>
//           </div>
//           <div class="content">
//               <div class="detail-box">
//                   <h3>Application Details</h3>
//                   <p><strong>Application ID:</strong> ${registration._id}</p>
//                   <p><strong>Name:</strong> ${fullName}</p>
//                   <p><strong>Program:</strong> University Preparation Intensive (UPI)</p>
//                   <p><strong>Applied On:</strong> ${new Date().toLocaleDateString()}</p>
//               </div>
              
//               <div class="next-steps">
//                   <h3>Next Steps</h3>
//                   <ol>
//                       <li>Our team will review your application within 3-5 business days</li>
//                       <li>You'll receive an email with the admission decision</li>
//                       <li>If accepted, payment instructions will be provided</li>
//                       <li>Program orientation materials will be sent upon payment confirmation</li>
//                   </ol>
//               </div>
              
//               <p>For any questions, contact us at info@scovers.org</p>
//           </div>
//       </body>
//       </html>
//       `
//     };

//     // Send notification email to admin
//     const adminMailOptions = {
//       from: '"Scovers Education" <info@scovers.org>',
//       to: 'info@scovers.org',
//       subject: `New UPI Application: ${fullName}`,
//       html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//           <style>
//               body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
//               .header { background: linear-gradient(135deg, #2D8CD4, #1A5F8B); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
//               .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 5px 5px; }
//               .detail-row { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; }
//               .detail-label { font-weight: bold; color: #2D8CD4; }
//           </style>
//       </head>
//       <body>
//           <div class="header">
//               <h2>New UPI Application</h2>
//           </div>
//           <div class="content">
//               <div class="detail-row">
//                   <span class="detail-label">Full Name:</span> ${fullName}
//               </div>
//               <div class="detail-row">
//                   <span class="detail-label">Email:</span> ${email}
//               </div>
//               <div class="detail-row">
//                   <span class="detail-label">Phone:</span> ${phoneNumber}
//               </div>
//               <div class="detail-row">
//                   <span class="detail-label">Academic Level:</span> ${academicLevel}
//               </div>
//               <div class="detail-row">
//                   <span class="detail-label">Intended Major:</span> ${intendedMajor}
//               </div>
//               <div class="detail-row">
//                   <span class="detail-label">Target Countries:</span> ${countriesArray.join(', ')}
//               </div>
//               <div class="detail-row">
//                   <span class="detail-label">Financial Readiness:</span> ${(financialReadiness || 'within_30_days').replace(/_/g, ' ')}
//               </div>
//               <div class="detail-row">
//                   <span class="detail-label">Documents Uploaded:</span> ${documents.length} files
//               </div>
//               <div class="detail-row">
//                   <span class="detail-label">Application Date:</span> ${new Date().toLocaleString()}
//               </div>
//           </div>
//       </body>
//       </html>
//       `
//     };

//     try {
//       // Send emails
//       await transporter.sendMail(studentMailOptions);
//       await transporter.sendMail(adminMailOptions);
//     } catch (emailError) {
//       console.error('Email sending failed:', emailError);
//       // Don't fail the request if email fails
//     }

//     res.status(201).json({
//       success: true,
//       message: 'UPI application submitted successfully',
//       data: {
//         applicationId: registration._id,
//         nextSteps: [
//           'Application under review',
//           'Decision within 3-5 business days',
//           'Check your email for updates'
//         ]
//       }
//     });

//   } catch (error) {
//     console.error('UPI registration error:', error);
    
//     // Clean up uploaded files if there was an error
//     if (req.files && req.files.length > 0) {
//       req.files.forEach(file => {
//         if (fs.existsSync(file.path)) {
//           fs.unlinkSync(file.path);
//         }
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Application submission failed',
//       error: error.message
//     });
//   }
// };

// module.exports.getUPIRegistrations = async (req, res) => {
//   try {
//     const { status, page = 1, limit = 10 } = req.query;
//     const query = status ? { status } : {};
    
//     const registrations = await UPIRegistration.find(query)
//       .sort({ registrationDate: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await UPIRegistration.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       count: registrations.length,
//       total,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//       data: registrations
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch UPI applications',
//       error: error.message
//     });
//   }
// };

// module.exports.getUPIApplication = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const application = await UPIRegistration.findById(id);

//     if (!application) {
//       return res.status(404).json({
//         success: false,
//         message: 'Application not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: application
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch application',
//       error: error.message
//     });
//   }
// };

// module.exports.updateApplicationStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const application = await UPIRegistration.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true, runValidators: true }
//     );

//     if (!application) {
//       return res.status(404).json({
//         success: false,
//         message: 'Application not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Application status updated',
//       data: application
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update application status',
//       error: error.message
//     });
//   }
// };




























// // const UPIRegistration = require('../Model/UPIModel');
// // const nodemailer = require('nodemailer');
// // const cloudinary = require('cloudinary').v2;

// // // Configure Cloudinary for document storage
// // cloudinary.config({
// //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //   api_key: process.env.CLOUDINARY_API_KEY,
// //   api_secret: process.env.CLOUDINARY_API_SECRET
// // });

// // // Configure Email transporter
// // const transporter = nodemailer.createTransport({
// //   host: 'smtp.titan.email',
// //   port: 587,
// //   secure: false,
// //   auth: {
// //     user: process.env.TITAN_EMAIL_USER,
// //     pass: process.env.TITAN_EMAIL_PASSWORD
// //   }
// // });

// // module.exports.registerForUPI = async (req, res) => {
// //   try {
// //     const {
// //       // Personal Info
// //       fullName, dateOfBirth, nationality, email, phoneNumber, address,
// //       // Academic Info
// //       currentSchool, academicLevel, intendedMajor, targetCountries,
// //       // Essay
// //       motivationEssay,
// //       // Financial
// //       financialReadiness,
// //       // Parental (if applicable)
// //       parentName, parentEmail, parentPhone, isMinor
// //     } = req.body;

// //     // Handle file uploads
// //     const documents = [];
// //     if (req.files && req.files.length > 0) {
// //       for (const file of req.files) {
// //         const result = await cloudinary.uploader.upload(file.path, {
// //           folder: 'upi_documents',
// //           resource_type: 'auto',
// //           format: 'pdf'
// //         });
// //         documents.push({
// //           name: file.originalname,
// //           fileUrl: result.secure_url
// //         });
// //       }
// //     }

// //     // Prepare parental consent data
// //     let parentalConsent = {};
// //     if (isMinor === 'true') {
// //       parentalConsent = {
// //         parentName,
// //         parentEmail,
// //         parentPhone,
// //         consentGiven: true,
// //         consentedAt: new Date()
// //       };
// //     }

// //     // Save registration to database
// //     const registration = await UPIRegistration.create({
// //       fullName,
// //       dateOfBirth,
// //       nationality,
// //       email,
// //       phoneNumber,
// //       address,
// //       currentSchool,
// //       academicLevel,
// //       intendedMajor,
// //       targetCountries: Array.isArray(targetCountries) ? targetCountries : [targetCountries],
// //       motivationEssay,
// //       financialReadiness,
// //       parentalConsent,
// //       documents
// //     });

// //     // Send confirmation email to student
// //     const studentMailOptions = {
// //       from: '"Scovers Education" <info@scovers.org>',
// //       to: email,
// //       subject: 'UPI Application Received - Scovers Education',
// //       html: `
// //       <!DOCTYPE html>
// //       <html>
// //       <head>
// //           <style>
// //               body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
// //               .header { background: linear-gradient(135deg, #2D8CD4, #1A5F8B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
// //               .content { padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
// //               .detail-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2D8CD4; }
// //               .next-steps { background: #e8f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
// //           </style>
// //       </head>
// //       <body>
// //           <div class="header">
// //               <h1>UPI Application Received</h1>
// //               <p>Thank you for applying to our University Preparation Intensive program</p>
// //           </div>
// //           <div class="content">
// //               <div class="detail-box">
// //                   <h3>Application Details</h3>
// //                   <p><strong>Application ID:</strong> ${registration._id}</p>
// //                   <p><strong>Name:</strong> ${fullName}</p>
// //                   <p><strong>Program:</strong> University Preparation Intensive (UPI)</p>
// //                   <p><strong>Applied On:</strong> ${new Date().toLocaleDateString()}</p>
// //               </div>
              
// //               <div class="next-steps">
// //                   <h3>Next Steps</h3>
// //                   <ol>
// //                       <li>Our team will review your application within 3-5 business days</li>
// //                       <li>You'll receive an email with the admission decision</li>
// //                       <li>If accepted, payment instructions will be provided</li>
// //                       <li>Program orientation materials will be sent upon payment confirmation</li>
// //                   </ol>
// //               </div>
              
// //               <p>For any questions, contact us at info@scovers.org</p>
// //           </div>
// //       </body>
// //       </html>
// //       `
// //     };

// //     // Send notification email to admin
// //     const adminMailOptions = {
// //       from: '"Scovers Education" <info@scovers.org>',
// //       to: 'info@scovers.org',
// //       subject: `New UPI Application: ${fullName}`,
// //       html: `
// //       <!DOCTYPE html>
// //       <html>
// //       <head>
// //           <style>
// //               body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
// //               .header { background: linear-gradient(135deg, #2D8CD4, #1A5F8B); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
// //               .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 5px 5px; }
// //               .detail-row { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; }
// //               .detail-label { font-weight: bold; color: #2D8CD4; }
// //           </style>
// //       </head>
// //       <body>
// //           <div class="header">
// //               <h2>New UPI Application</h2>
// //           </div>
// //           <div class="content">
// //               <div class="detail-row">
// //                   <span class="detail-label">Full Name:</span> ${fullName}
// //               </div>
// //               <div class="detail-row">
// //                   <span class="detail-label">Email:</span> ${email}
// //               </div>
// //               <div class="detail-row">
// //                   <span class="detail-label">Phone:</span> ${phoneNumber}
// //               </div>
// //               <div class="detail-row">
// //                   <span class="detail-label">Academic Level:</span> ${academicLevel}
// //               </div>
// //               <div class="detail-row">
// //                   <span class="detail-label">Intended Major:</span> ${intendedMajor}
// //               </div>
// //               <div class="detail-row">
// //                   <span class="detail-label">Target Countries:</span> ${targetCountries.join(', ')}
// //               </div>
// //               <div class="detail-row">
// //                   <span class="detail-label">Financial Readiness:</span> ${financialReadiness.replace(/_/g, ' ')}
// //               </div>
// //               <div class="detail-row">
// //                   <span class="detail-label">Documents Uploaded:</span> ${documents.length} files
// //               </div>
// //               <div class="detail-row">
// //                   <span class="detail-label">Application Date:</span> ${new Date().toLocaleString()}
// //               </div>
// //           </div>
// //       </body>
// //       </html>
// //       `
// //     };

// //     // Send emails
// //     await transporter.sendMail(studentMailOptions);
// //     await transporter.sendMail(adminMailOptions);

// //     res.status(201).json({
// //       success: true,
// //       message: 'UPI application submitted successfully',
// //       data: {
// //         applicationId: registration._id,
// //         nextSteps: [
// //           'Application under review',
// //           'Decision within 3-5 business days',
// //           'Check your email for updates'
// //         ]
// //       }
// //     });

// //   } catch (error) {
// //     console.error('UPI registration error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Application submission failed',
// //       error: error.message
// //     });
// //   }
// // };

// // module.exports.getUPIRegistrations = async (req, res) => {
// //   try {
// //     const { status, page = 1, limit = 10 } = req.query;
// //     const query = status ? { status } : {};
    
// //     const registrations = await UPIRegistration.find(query)
// //       .sort({ registrationDate: -1 })
// //       .limit(limit * 1)
// //       .skip((page - 1) * limit);

// //     const total = await UPIRegistration.countDocuments(query);

// //     res.status(200).json({
// //       success: true,
// //       count: registrations.length,
// //       total,
// //       currentPage: page,
// //       totalPages: Math.ceil(total / limit),
// //       data: registrations
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to fetch UPI applications',
// //       error: error.message
// //     });
// //   }
// // };

// // module.exports.getUPIApplication = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const application = await UPIRegistration.findById(id);

// //     if (!application) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Application not found'
// //       });
// //     }

// //     res.status(200).json({
// //       success: true,
// //       data: application
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to fetch application',
// //       error: error.message
// //     });
// //   }
// // };

// // module.exports.updateApplicationStatus = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { status } = req.body;

// //     const application = await UPIRegistration.findByIdAndUpdate(
// //       id,
// //       { status },
// //       { new: true, runValidators: true }
// //     );

// //     if (!application) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Application not found'
// //       });
// //     }

// //     res.status(200).json({
// //       success: true,
// //       message: 'Application status updated',
// //       data: application
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to update application status',
// //       error: error.message
// //     });
// //   }
// // };