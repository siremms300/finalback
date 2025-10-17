// models/AnalyticsModel.js
const mongoose = require('mongoose');

// Sub-schemas for better organization
const pageViewSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  scrollDepth: {
    type: Number, // percentage 0-100
    default: 0
  },
  timeOnPage: {
    type: Number, // in seconds
    default: 0
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: Date,
  referrer: String,
  queryParams: Object,
  hash: String
}, { _id: true });

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true
  },
  category: String,
  action: String,
  label: String,
  value: Number,
  properties: Object,
  timestamp: {
    type: Date,
    default: Date.now
  },
  page: String,
  element: String,
  coordinates: {
    x: Number,
    y: Number
  }
}, { _id: true });

const performanceSchema = new mongoose.Schema({
  dnsLookup: Number,
  tcpConnection: Number,
  ttfb: Number, // Time to First Byte
  domContentLoaded: Number,
  windowLoad: Number,
  firstContentfulPaint: Number,
  largestContentfulPaint: Number,
  cumulativeLayoutShift: Number,
  firstInputDelay: Number,
  resourceLoadTimes: [{
    name: String,
    duration: Number,
    size: Number
  }]
}, { _id: false });

const engagementSchema = new mongoose.Schema({
  totalClicks: {
    type: Number,
    default: 0
  },
  totalScrolls: {
    type: Number,
    default: 0
  },
  totalKeypresses: {
    type: Number,
    default: 0
  },
  formsStarted: {
    type: Number,
    default: 0
  },
  formsCompleted: {
    type: Number,
    default: 0
  },
  videosStarted: {
    type: Number,
    default: 0
  },
  videosCompleted: {
    type: Number,
    default: 0
  },
  downloads: [{
    file: String,
    timestamp: Date
  }]
}, { _id: false });

const analyticsSchema = new mongoose.Schema({
  // Session & Visitor Identification
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  visitorId: {
    type: String,
    required: true
  },
  
  // Technical Information
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: String,
  
  // Geographic Data
  geoData: {
    country: String,
    region: String,
    city: String,
    timezone: String,
    latitude: Number,
    longitude: Number,
    postalCode: String,
    countryCode: String,
    regionCode: String,
    continent: String
  },
  
  // Device & Browser Details
  browser: {
    name: String,
    version: String,
    engine: String,
    major: String
  },
  os: {
    name: String,
    version: String,
    platform: String
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile', 'bot', 'unknown'],
      default: 'desktop'
    },
    vendor: String,
    model: String,
    mobile: Boolean,
    orientation: String
  },
  
  // Screen & Viewport
  screenResolution: {
    width: Number,
    height: Number,
    colorDepth: Number,
    pixelRatio: Number
  },
  viewportSize: {
    width: Number,
    height: Number
  },
  
  // Network & Connection
  connection: {
    effectiveType: String, // '4g', '3g', '2g', 'slow-2g'
    downlink: Number,
    rtt: Number, // Round Trip Time
    saveData: Boolean
  },
  
  // Session Details
  language: String,
  referrer: String,
  landingPage: String,
  initialReferrer: String,
  
  // Tracking Data
  pageViews: [pageViewSchema],
  events: [eventSchema],
  performance: performanceSchema,
  engagement: engagementSchema,
  
  // Session Metrics
  sessionDuration: {
    type: Number,
    default: 0
  },
  pageCount: {
    type: Number,
    default: 0
  },
  isReturning: {
    type: Boolean,
    default: false
  },
  isFirstSession: {
    type: Boolean,
    default: true
  },
  
  // User Identification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Marketing Attribution
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmTerm: String,
  utmContent: String,
  
  // Additional Tracking
  source: String,
  medium: String,
  campaign: String,
  keyword: String,
  content: String,
  
  // Session Status
  sessionEnded: {
    type: Boolean,
    default: false
  },
  sessionEndTime: Date,
  
  // Privacy & Compliance
  consentGiven: {
    type: Boolean,
    default: false
  },
  doNotTrack: Boolean
}, {
  timestamps: true
});

// Comprehensive Indexing
analyticsSchema.index({ createdAt: -1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ visitorId: 1 });
analyticsSchema.index({ userId: 1 });
analyticsSchema.index({ 'geoData.country': 1 });
analyticsSchema.index({ 'device.type': 1 });
analyticsSchema.index({ 'browser.name': 1 });
analyticsSchema.index({ 'os.name': 1 });
analyticsSchema.index({ utmSource: 1, utmCampaign: 1 });
analyticsSchema.index({ sessionEnded: 1 });
analyticsSchema.index({ 'pageViews.path': 1 });
analyticsSchema.index({ 'events.eventName': 1 });
analyticsSchema.index({ 'events.timestamp': 1 });

// Virtual for session date
analyticsSchema.virtual('sessionDate').get(function() {
  return this.createdAt.toISOString().split('T')[0];
});

// Methods
analyticsSchema.methods.calculateBounce = function() {
  return this.pageViews.length <= 1 && this.sessionDuration < 30;
};

analyticsSchema.methods.getDeviceCategory = function() {
  if (this.viewportSize.width < 768) return 'mobile';
  if (this.viewportSize.width < 1024) return 'tablet';
  return 'desktop';
};

module.exports = mongoose.model('Analytics', analyticsSchema);























































// // models/AnalyticsModel.js
// const mongoose = require('mongoose');

// const pageViewSchema = new mongoose.Schema({
//   path: {
//     type: String,
//     required: true
//   },
//   title: {
//     type: String,
//     required: true
//   },
//   duration: {
//     type: Number, // in seconds
//     default: 0
//   }
// }, { _id: false });

// const analyticsSchema = new mongoose.Schema({
//   sessionId: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   visitorId: {
//     type: String,
//     required: true
//   },
//   events: [{
//   eventName: String,
//   properties: Object,
//   timestamp: Date
// }],
//   ipAddress: {
//     type: String,
//     required: true
//   },
//   userAgent: {
//     type: String,
//     required: true
//   },
//   country: String,
//   region: String,
//   city: String,
//   timezone: String,
//   browser: {
//     name: String,
//     version: String
//   },
//   os: {
//     name: String,
//     version: String
//   },
//   device: {
//     type: {
//       type: String,
//       enum: ['desktop', 'tablet', 'mobile'],
//       default: 'desktop'
//     },
//     vendor: String,
//     model: String
//   },
//   screenResolution: {
//     width: Number,
//     height: Number
//   },
//   language: String,
//   referrer: String,
//   landingPage: String,
//   pageViews: [pageViewSchema],
//   sessionDuration: {
//     type: Number, // in seconds
//     default: 0
//   },
//   isReturning: {
//     type: Boolean,
//     default: false
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   utmSource: String,
//   utmMedium: String,
//   utmCampaign: String,
//   utmTerm: String,
//   utmContent: String
// }, {
//   timestamps: true
// });

// // Indexes for better query performance
// analyticsSchema.index({ createdAt: -1 });
// analyticsSchema.index({ visitorId: 1 });
// analyticsSchema.index({ country: 1 });
// analyticsSchema.index({ 'device.type': 1 }); 
// analyticsSchema.index({ userId: 1 });

// module.exports = mongoose.model('Analytics', analyticsSchema);


