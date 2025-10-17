const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const uPIRegistrationSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  
  // Academic Information
  currentSchool: {
    type: String,
    required: [true, 'Current school is required']
  },
  academicLevel: {
    type: String,
    required: [true, 'Academic level is required'],
    enum: ['SS1', 'SS2', 'SS3', 'Graduate', 'Other']
  },
  intendedMajor: {
    type: String,
    required: [true, 'Intended major is required']
  },
  targetCountries: [{
    type: String,
    required: true
  }],
  
  // Documents
  documents: [documentSchema],
  
  // Essay
  motivationEssay: {
    type: String,
    required: [true, 'Motivation essay is required'],
    minlength: [200, 'Essay must be at least 200 characters']
  },
  
  // Financial Information
  financialReadiness: {
    type: String,
    required: true,
    enum: ['within_7_days', 'within_14_days', 'within_30_days', 'need_financial_aid']
  },
  
  // Parental Information (for minors)
  parentalConsent: {
    parentName: String,
    parentEmail: String,
    parentPhone: String,
    consentGiven: Boolean,
    consentedAt: Date
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'accepted', 'rejected', 'waitlisted'],
    default: 'pending'
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'waived'],
    default: 'pending'
  },
  
  registrationDate: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
uPIRegistrationSchema.index({ email: 1 });
uPIRegistrationSchema.index({ status: 1 });
uPIRegistrationSchema.index({ registrationDate: -1 });

const UPIRegistration = mongoose.model('UPIRegistration', uPIRegistrationSchema);
module.exports = UPIRegistration;