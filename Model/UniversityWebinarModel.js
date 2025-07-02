const mongoose = require('mongoose');

const universityWebinarRegistrationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required']
  },
  universityName: {
    type: String,
    required: false
  },
  annualFair: {
    type: Boolean,
    required: [true, 'Please indicate interest']
  },

  biweeklyFair: {
    type: Boolean,
    required: [true, 'Please indicate interest']
  },
  partnership: {
    type: Boolean,
    required: [true, 'Please indicate interest']
  },
  promotionMaterial: {
    type: Boolean,
    required: [true, 'Please indicate interest']
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
});

const UniversityWebinarRegistration = mongoose.model('UniversityWebinarRegistration', universityWebinarRegistrationSchema);
module.exports = UniversityWebinarRegistration;





// Question : 
// Would you consider attending our fair in November ? 

// Would you consider attending our bi weekly webinars to meet prospective  students? 

// Would you like to have a partnership with Scovers for lead generation within the Nigerian market ? 

// Do you have promotional material such as fliers and videos you can share with scovers for easy promotion ?