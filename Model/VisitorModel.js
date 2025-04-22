const mongoose = require('mongoose');

const visitorRegistrationSchema = new mongoose.Schema({
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
  preferredCourse: {
    type: String,
    required: false
  },
  preferredCountry: {
    type: String,
    required: false
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
});

const VisitorRegistration = mongoose.model('VisitorRegistration', visitorRegistrationSchema);
module.exports = VisitorRegistration;