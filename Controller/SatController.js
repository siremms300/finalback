const SATRegistration = require('../Model/SatModel');

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