const mongoose = require('mongoose');

const SATSchema = new mongoose.Schema({
  // Basic Bio-Data
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required']
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
  currentClass: {
    type: String,
    enum: ['JSS', 'SSS', 'Grade 11', 'Grade 12'],
    required: [true, 'Current class is required']
  },
  
  // Academic Information
  currentGPA: {
    type: Number,
    required: [true, 'Current GPA is required'],
    min: [0, 'GPA cannot be negative'],
    max: [5, 'GPA cannot exceed 5.0']
  },
  isStraightAStudent: {
    type: Boolean,
    required: [true, 'Please indicate if you are a straight A student']
  },
  interestInStudyingAbroad: {
    type: Boolean,
    required: [true, 'Please indicate interest in studying abroad']
  },
  
  // Financial Information
  sponsorAvailability: {
    type: String,
    enum: ['5000-7000', '7000-15000', '15000-20000', 'none'],
    required: [true, 'Please select sponsor availability']
  },
  
  // Referral Information
  referralSource: {
    type: String,
    enum: ['Social Media', 'Pocketfriendlydigitals', 'Individual Recommendation', 'Other'],
    required: [true, 'Referral source is required']
  },
  referrerName: {
    type: String,
    required: function() {
      return this.referralSource === 'Individual Recommendation';
    },
    default: null
  },
  referrerPhone: {
    type: String,
    required: function() {
      return this.referralSource === 'Individual Recommendation';
    },
    default: null
  },
  referrerEmail: {
    type: String,
    required: function() {
      return this.referralSource === 'Individual Recommendation';
    },
    default: null
  },
  
  // Metadata
  registrationDate: {
    type: Date,
    default: Date.now
  },
  parentConsent: {
    type: Boolean,
    required: [true, 'Parent consent is required'],
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'You must have parent consent to register'
    }
  }
}, {
  timestamps: true
});

// Add index for better query performance
SATSchema.index({ email: 1 });
SATSchema.index({ phoneNumber: 1 });

const SATRegistration = mongoose.model('SATRegistration', SATSchema);
module.exports = SATRegistration;