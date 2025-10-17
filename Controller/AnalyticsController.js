// controllers/AnalyticsController.js
const Analytics = require('../Model/AnalyticsModel');
const axios = require('axios');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite'); // Make sure to install: npm install geoip-lite

// Enhanced IP to Location with multiple fallbacks
const getEnhancedLocationFromIP = async (ip) => {
  try {
    // Clean IP address (remove IPv6 prefix if present)
    const cleanIP = ip.replace(/^::ffff:/, '');
    
    // Try multiple services for better accuracy
    const services = [
      `http://ip-api.com/json/${cleanIP}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as`,
      `https://ipapi.co/${cleanIP}/json/`
    ];
    
    for (const service of services) {
      try {
        const response = await axios.get(service, { timeout: 5000 });
        
        if (service.includes('ip-api.com') && response.data.status === 'success') {
          return {
            country: response.data.country,
            region: response.data.regionName,
            city: response.data.city,
            timezone: response.data.timezone,
            latitude: response.data.lat,
            longitude: response.data.lon,
            postalCode: response.data.zip,
            countryCode: response.data.countryCode,
            regionCode: response.data.region,
            continent: getContinentFromCountry(response.data.countryCode),
            isp: response.data.isp,
            organization: response.data.org
          };
        }
        
        if (service.includes('ipapi.co') && response.data.country_name) {
          return {
            country: response.data.country_name,
            region: response.data.region,
            city: response.data.city,
            timezone: response.data.timezone,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            postalCode: response.data.postal,
            countryCode: response.data.country_code,
            regionCode: response.data.region_code,
            continent: response.data.continent_code
          };
        }
      } catch (error) {
        continue; // Try next service
      }
    }
    
    // Fallback to geoip-lite
    const geo = geoip.lookup(cleanIP);
    if (geo) {
      return {
        country: geo.country,
        region: geo.region,
        city: geo.city,
        timezone: geo.timezone,
        latitude: geo.ll[0],
        longitude: geo.ll[1],
        countryCode: geo.country
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error getting enhanced location:', error);
    return {};
  }
};

const getContinentFromCountry = (countryCode) => {
  const continentMap = {
    // North America
    'US': 'NA', 'CA': 'NA', 'MX': 'NA',
    // Europe
    'GB': 'EU', 'FR': 'EU', 'DE': 'EU', 'IT': 'EU', 'ES': 'EU',
    // Asia
    'CN': 'AS', 'JP': 'AS', 'IN': 'AS', 'KR': 'AS',
    // Add more as needed
  };
  return continentMap[countryCode] || 'Unknown';
};

// Enhanced User Agent Parser
const parseEnhancedUserAgent = (userAgent) => {
  const parser = new UAParser();
  const result = parser.setUA(userAgent).getResult();
  
  return {
    browser: {
      name: result.browser.name,
      version: result.browser.version,
      major: result.browser.major,
      engine: result.engine.name
    },
    os: {
      name: result.os.name,
      version: result.os.version,
      platform: result.os.name?.toLowerCase().includes('windows') ? 'windows' : 
                result.os.name?.toLowerCase().includes('mac') ? 'mac' : 
                result.os.name?.toLowerCase().includes('linux') ? 'linux' : 'other'
    },
    device: {
      type: result.device.type || 'desktop',
      vendor: result.device.vendor,
      model: result.device.model,
      mobile: !!result.device.type && result.device.type !== 'desktop'
    }
  };
};

// Get Network Information (client-side, but we can store it)
const parseConnectionInfo = (connectionData) => {
  if (!connectionData) return {};
  
  return {
    effectiveType: connectionData.effectiveType,
    downlink: connectionData.downlink,
    rtt: connectionData.rtt,
    saveData: connectionData.saveData
  };
};

// Enhanced Session Tracking
// const trackSessionStart = async (req, res) => {
//   try {
//     const {
//       sessionId,
//       visitorId,
//       userAgent,
//       screenResolution,
//       viewportSize,
//       connection,
//       language,
//       referrer,
//       landingPage,
//       urlParams,
//       consentGiven = false,
//       doNotTrack = false
//     } = req.body;

//     // Get client IP address
//     const ipAddress = req.ip || 
//                      req.headers['x-forwarded-for']?.split(',')[0] || 
//                      req.connection.remoteAddress || 
//                      req.socket.remoteAddress;

//     // Enhanced data collection
//     const [locationData, userAgentData] = await Promise.all([
//       getEnhancedLocationFromIP(ipAddress),
//       Promise.resolve(parseEnhancedUserAgent(userAgent))
//     ]);

//     const connectionInfo = parseConnectionInfo(connection);

//     // Check visitor history
//     const visitorSessions = await Analytics.find({ visitorId });
//     const isReturning = visitorSessions.length > 0;
//     const isFirstSession = !isReturning;

//     // Parse UTM parameters and other marketing data
//     const marketingData = extractMarketingData(urlParams, referrer);

//     // Create analytics session
//     const analyticsSession = new Analytics({
//       sessionId,
//       visitorId,
//       ipAddress,
//       userAgent,
//       geoData: locationData,
//       ...userAgentData,
//       screenResolution,
//       viewportSize,
//       connection: connectionInfo,
//       language,
//       referrer,
//       initialReferrer: referrer,
//       landingPage,
//       isReturning,
//       isFirstSession,
//       ...marketingData,
//       consentGiven,
//       doNotTrack,
//       userId: req.user?._id
//     });

//     await analyticsSession.save();

//     res.status(200).json({
//       success: true,
//       message: 'Session tracked successfully',
//       data: {
//         sessionId,
//         visitorId,
//         isReturning
//       }
//     });
//   } catch (error) {
//     console.error('Error tracking session:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to track session',
//       error: error.message
//     });
//   }
// };

// Enhanced Session Tracking with better validation
const trackSessionStart = async (req, res) => {
  try {
    const {
      sessionId,
      visitorId,
      userAgent,
      screenResolution,
      viewportSize,
      connection,
      language,
      referrer,
      landingPage,
      urlParams,
      consentGiven = false,
      doNotTrack = false
    } = req.body;

    // Validate required fields
    if (!sessionId || !visitorId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and visitorId are required'
      });
    }

    // Enhanced IP address detection
    let ipAddress = req.ip;
    if (!ipAddress || ipAddress === '::1') {
      ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                  req.headers['x-real-ip'] ||
                  req.connection?.remoteAddress || 
                  req.socket?.remoteAddress ||
                  '127.0.0.1';
    }

    // Clean IP address (remove IPv6 prefix if present)
    ipAddress = ipAddress.replace(/^::ffff:/, '');

    console.log('Tracking session:', {
      sessionId,
      visitorId,
      ipAddress,
      hasUserAgent: !!userAgent
    });

    // Enhanced data collection
    const [locationData, userAgentData] = await Promise.all([
      getEnhancedLocationFromIP(ipAddress),
      Promise.resolve(parseEnhancedUserAgent(userAgent || ''))
    ]);

    const connectionInfo = parseConnectionInfo(connection);

    // Check visitor history
    const visitorSessions = await Analytics.find({ visitorId });
    const isReturning = visitorSessions.length > 0;
    const isFirstSession = !isReturning;

    // Parse UTM parameters and other marketing data
    const marketingData = extractMarketingData(urlParams, referrer);

    // Create analytics session with default values for missing fields
    const analyticsData = {
      sessionId: sessionId.trim(),
      visitorId: visitorId.trim(),
      ipAddress,
      userAgent: userAgent || '',
      geoData: locationData,
      ...userAgentData,
      screenResolution: screenResolution || { width: 0, height: 0 },
      viewportSize: viewportSize || { width: 0, height: 0 },
      connection: connectionInfo,
      language: language || 'en',
      referrer: referrer || 'direct',
      initialReferrer: referrer || 'direct',
      landingPage: landingPage || '/',
      isReturning,
      isFirstSession,
      ...marketingData,
      consentGiven,
      doNotTrack,
      userId: req.user?._id
    };

    // Remove undefined values that might cause validation issues
    Object.keys(analyticsData).forEach(key => {
      if (analyticsData[key] === undefined) {
        delete analyticsData[key];
      }
    });

    const analyticsSession = new Analytics(analyticsData);
    await analyticsSession.save();

    console.log('Session tracked successfully:', analyticsSession.sessionId);

    res.status(200).json({
      success: true,
      message: 'Session tracked successfully',
      data: {
        sessionId: analyticsSession.sessionId,
        visitorId: analyticsSession.visitorId,
        isReturning
      }
    });
  } catch (error) {
    console.error('Error tracking session:', error);
    
    // More detailed error response
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to track session',
      error: error.message
    });
  }
};

// Enhanced Page View Tracking
const trackPageView = async (req, res) => {
  try {
    const { 
      sessionId, 
      path, 
      title, 
      referrer, 
      queryParams, 
      hash,
      performance 
    } = req.body;

    const pageView = {
      path,
      title,
      referrer,
      queryParams,
      hash,
      entryTime: new Date()
    };

    const updateData = {
      $push: { pageViews: pageView },
      $inc: { pageCount: 1 },
      $set: { 
        'performance.domContentLoaded': performance?.domContentLoaded,
        'performance.windowLoad': performance?.windowLoad
      }
    };

    // Update performance metrics if available
    if (performance) {
      updateData.$set = {
        ...updateData.$set,
        'performance.ttfb': performance.ttfb,
        'performance.firstContentfulPaint': performance.firstContentfulPaint,
        'performance.largestContentfulPaint': performance.largestContentfulPaint,
        'performance.cumulativeLayoutShift': performance.cumulativeLayoutShift
      };
    }

    await Analytics.findOneAndUpdate(
      { sessionId },
      updateData
    );

    res.status(200).json({
      success: true,
      message: 'Page view tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track page view'
    });
  }
};

// Track Page Exit (for duration calculation)
const trackPageExit = async (req, res) => {
  try {
    const { sessionId, path, duration, scrollDepth } = req.body;

    await Analytics.findOneAndUpdate(
      { 
        sessionId,
        'pageViews.path': path,
        'pageViews.exitTime': { $exists: false }
      },
      {
        $set: {
          'pageViews.$.exitTime': new Date(),
          'pageViews.$.duration': duration,
          'pageViews.$.scrollDepth': scrollDepth,
          'pageViews.$.timeOnPage': duration
        },
        $inc: { sessionDuration: duration }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Page exit tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking page exit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track page exit'
    });
  }
};

// Enhanced Event Tracking
const trackEvent = async (req, res) => {
  try {
    const { 
      sessionId, 
      eventName, 
      category, 
      action, 
      label, 
      value, 
      properties,
      page,
      element,
      coordinates
    } = req.body;

    const event = {
      eventName,
      category,
      action,
      label,
      value,
      properties,
      page,
      element,
      coordinates,
      timestamp: new Date()
    };

    // Update engagement metrics based on event type
    const engagementUpdate = {};
    switch (eventName) {
      case 'click':
        engagementUpdate.$inc = { 'engagement.totalClicks': 1 };
        break;
      case 'scroll':
        engagementUpdate.$inc = { 'engagement.totalScrolls': 1 };
        break;
      case 'form_start':
        engagementUpdate.$inc = { 'engagement.formsStarted': 1 };
        break;
      case 'form_complete':
        engagementUpdate.$inc = { 'engagement.formsCompleted': 1 };
        break;
      case 'video_start':
        engagementUpdate.$inc = { 'engagement.videosStarted': 1 };
        break;
      case 'video_complete':
        engagementUpdate.$inc = { 'engagement.videosCompleted': 1 };
        break;
      case 'download':
        engagementUpdate.$push = { 
          'engagement.downloads': {
            file: properties?.file,
            timestamp: new Date()
          }
        };
        break;
    }

    const updateData = {
      $push: { events: event },
      ...engagementUpdate
    };

    await Analytics.findOneAndUpdate(
      { sessionId },
      updateData
    );

    res.status(200).json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event'
    });
  }
};

// Track Performance Metrics
const trackPerformance = async (req, res) => {
  try {
    const { sessionId, performanceMetrics } = req.body;

    await Analytics.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          performance: performanceMetrics
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Performance metrics tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track performance metrics'
    });
  }
};

// Track Session End with Enhanced Data
const trackSessionEnd = async (req, res) => {
  try {
    const { sessionId, duration, reason = 'normal' } = req.body;

    await Analytics.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          sessionDuration: duration,
          sessionEnded: true,
          sessionEndTime: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Session end tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking session end:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track session end'
    });
  }
};

// Advanced Dashboard Statistics
const getAdvancedDashboardStats = async (req, res) => {
  try {
    const { range = '7d', compare = false } = req.query;
    
    const dateRange = calculateDateRange(range);
    const previousDateRange = compare ? calculateDateRange(range, true) : null;

    // Parallel data fetching for better performance
    const [
      basicStats,
      trafficSources,
      pagePerformance,
      userBehavior,
      geographicData,
      deviceStats,
      previousPeriodStats
    ] = await Promise.all([
      getBasicStats(dateRange),
      getTrafficSources(dateRange),
      getPagePerformance(dateRange),
      getUserBehavior(dateRange),
      getGeographicData(dateRange),
      getDeviceStats(dateRange),
      compare ? getBasicStats(previousDateRange) : Promise.resolve(null)
    ]);

    const data = {
      overview: basicStats,
      trafficSources,
      pagePerformance,
      userBehavior,
      geographicData,
      deviceStats,
      trends: compare ? calculateTrends(basicStats, previousPeriodStats) : null
    };

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting advanced dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load analytics data'
    });
  }
};

// Real-time Analytics
const getRealTimeStats = async (req, res) => {
  try {
    const currentTime = new Date();
    const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60 * 1000);
    const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

    const [
      activeVisitors,
      recentPageViews,
      currentEvents,
      geographicDistribution
    ] = await Promise.all([
      // Active visitors (sessions with activity in last 5 minutes)
      Analytics.countDocuments({
        sessionEnded: false,
        updatedAt: { $gte: fiveMinutesAgo }
      }),
      
      // Recent page views
      Analytics.aggregate([
        { $match: { updatedAt: { $gte: oneHourAgo } } },
        { $unwind: '$pageViews' },
        { $match: { 'pageViews.entryTime': { $gte: oneHourAgo } } },
        { $group: {
          _id: '$pageViews.path',
          title: { $first: '$pageViews.title' },
          views: { $sum: 1 },
          lastView: { $max: '$pageViews.entryTime' }
        }},
        { $sort: { views: -1 } },
        { $limit: 10 }
      ]),
      
      // Current events
      Analytics.aggregate([
        { $match: { 
          sessionEnded: false,
          'events.timestamp': { $gte: fiveMinutesAgo }
        }},
        { $unwind: '$events' },
        { $match: { 'events.timestamp': { $gte: fiveMinutesAgo } } },
        { $group: {
          _id: '$events.eventName',
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } }
      ]),
      
      // Geographic distribution of active visitors
      Analytics.aggregate([
        { $match: { 
          sessionEnded: false,
          updatedAt: { $gte: fiveMinutesAgo }
        }},
        { $group: {
          _id: '$geoData.country',
          count: { $sum: 1 },
          countryCode: { $first: '$geoData.countryCode' }
        }},
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        activeVisitors,
        recentPageViews,
        currentEvents,
        geographicDistribution,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error getting real-time stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load real-time data'
    });
  }
};

// User Journey Analysis
const getUserJourney = async (req, res) => {
  try {
    const { visitorId, sessionId } = req.query;
    
    let matchQuery = {};
    if (visitorId) matchQuery.visitorId = visitorId;
    if (sessionId) matchQuery.sessionId = sessionId;

    const userJourney = await Analytics.aggregate([
      { $match: matchQuery },
      { $sort: { createdAt: 1 } },
      { $unwind: '$pageViews' },
      { $sort: { 'pageViews.entryTime': 1 } },
      { $group: {
        _id: '$sessionId',
        visitorId: { $first: '$visitorId' },
        sessionStart: { $first: '$createdAt' },
        sessionEnd: { $first: '$sessionEndTime' },
        pages: {
          $push: {
            path: '$pageViews.path',
            title: '$pageViews.title',
            entryTime: '$pageViews.entryTime',
            exitTime: '$pageViews.exitTime',
            duration: '$pageViews.duration',
            scrollDepth: '$pageViews.scrollDepth'
          }
        },
        totalDuration: { $first: '$sessionDuration' },
        device: { $first: '$device' },
        location: { $first: '$geoData' }
      }},
      { $project: {
        _id: 0,
        sessionId: '$_id',
        visitorId: 1,
        sessionStart: 1,
        sessionEnd: 1,
        pages: 1,
        totalDuration: 1,
        device: 1,
        location: 1,
        pageCount: { $size: '$pages' }
      }}
    ]);

    res.status(200).json({
      success: true,
      data: userJourney
    });
  } catch (error) {
    console.error('Error getting user journey:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load user journey data'
    });
  }
};

// Helper function to extract marketing data
const extractMarketingData = (urlParams, referrer) => {
  const data = {};
  
  // UTM Parameters
  if (urlParams) {
    data.utmSource = urlParams.utm_source;
    data.utmMedium = urlParams.utm_medium;
    data.utmCampaign = urlParams.utm_campaign;
    data.utmTerm = urlParams.utm_term;
    data.utmContent = urlParams.utm_content;
  }
  
  // Organic search detection
  if (referrer && !data.utmSource) {
    const searchEngines = [
      'google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex'
    ];
    
    const referrerHost = new URL(referrer).hostname.toLowerCase();
    const isSearchEngine = searchEngines.some(engine => 
      referrerHost.includes(engine)
    );
    
    if (isSearchEngine) {
      data.source = referrerHost;
      data.medium = 'organic';
      data.keyword = urlParams?.q || urlParams?.query;
    } else {
      data.source = referrerHost;
      data.medium = 'referral';
    }
  } else if (!referrer && !data.utmSource) {
    data.source = '(direct)';
    data.medium = '(none)';
  }
  
  return data;
};

// Helper Functions
const calculateDateRange = (range, previous = false) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = now;

  switch (range) {
    case '1d':
      startDate.setDate(now.getDate() - (previous ? 2 : 1));
      break;
    case '7d':
      startDate.setDate(now.getDate() - (previous ? 14 : 7));
      break;
    case '30d':
      startDate.setDate(now.getDate() - (previous ? 60 : 30));
      break;
    case '90d':
      startDate.setDate(now.getDate() - (previous ? 180 : 90));
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  if (previous) {
    endDate = new Date(startDate.getTime());
    startDate.setDate(startDate.getDate() - (range === '1d' ? 1 : 
                         range === '7d' ? 7 : 
                         range === '30d' ? 30 : 90));
  }

  return { startDate, endDate };
};

const getBasicStats = async (dateRange) => {
  const sessions = await Analytics.find({
    createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
  });

  const totalSessions = sessions.length;
  const totalVisitors = new Set(sessions.map(s => s.visitorId)).size;
  const totalPageViews = sessions.reduce((sum, session) => 
    sum + (session.pageViews?.length || 0), 0
  );
  
  const totalDuration = sessions.reduce((sum, session) => 
    sum + (session.sessionDuration || 0), 0
  );
  
  const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

  // Calculate bounce rate (sessions with only 1 page view and < 30 seconds)
  const bouncedSessions = sessions.filter(session => 
    session.pageViews?.length <= 1 && session.sessionDuration < 30
  ).length;
  
  const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

  return {
    totalSessions,
    totalVisitors,
    totalPageViews,
    avgSessionDuration: Math.round(avgSessionDuration),
    bounceRate: Math.round(bounceRate * 100) / 100,
    pagesPerSession: totalSessions > 0 ? (totalPageViews / totalSessions) : 0
  };
};

const getTrafficSources = async (dateRange) => {
  return Analytics.aggregate([
    { $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } },
    { $group: {
      _id: {
        source: { $ifNull: ['$utmSource', '$source'] },
        medium: { $ifNull: ['$utmMedium', '$medium'] }
      },
      sessions: { $sum: 1 },
      visitors: { $addToSet: '$visitorId' },
      totalDuration: { $sum: '$sessionDuration' },
      pageViews: { $sum: { $size: '$pageViews' } }
    }},
    { $project: {
      _id: 0,
      source: '$_id.source',
      medium: '$_id.medium',
      sessions: 1,
      visitors: { $size: '$visitors' },
      avgDuration: { $divide: ['$totalDuration', '$sessions'] },
      pagesPerSession: { $divide: ['$pageViews', '$sessions'] }
    }},
    { $sort: { sessions: -1 } }
  ]);
};

const getPagePerformance = async (dateRange) => {
  return Analytics.aggregate([
    { $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } },
    { $unwind: '$pageViews' },
    { $group: {
      _id: '$pageViews.path',
      title: { $first: '$pageViews.title' },
      views: { $sum: 1 },
      avgDuration: { $avg: '$pageViews.duration' },
      avgScrollDepth: { $avg: '$pageViews.scrollDepth' },
      entries: { $sum: 1 },
      exits: { 
        $sum: { 
          $cond: [{ $ifNull: ['$pageViews.exitTime', false] }, 1, 0] 
        }
      }
    }},
    { $project: {
      _id: 0,
      path: '$_id',
      title: 1,
      views: 1,
      avgDuration: { $round: ['$avgDuration', 2] },
      avgScrollDepth: { $round: ['$avgScrollDepth', 2] },
      exitRate: { $multiply: [{ $divide: ['$exits', '$entries'] }, 100] }
    }},
    { $sort: { views: -1 } },
    { $limit: 20 }
  ]);
};

const getUserBehavior = async (dateRange) => {
  return Analytics.aggregate([
    { $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } },
    { $group: {
      _id: null,
      totalClicks: { $sum: '$engagement.totalClicks' },
      totalScrolls: { $sum: '$engagement.totalScrolls' },
      formsStarted: { $sum: '$engagement.formsStarted' },
      formsCompleted: { $sum: '$engagement.formsCompleted' },
      conversionRate: {
        $avg: {
          $cond: [
            { $gt: ['$engagement.formsStarted', 0] },
            { $divide: ['$engagement.formsCompleted', '$engagement.formsStarted'] },
            0
          ]
        }
      }
    }}
  ]);
};

const getGeographicData = async (dateRange) => {
  return Analytics.aggregate([
    { $match: { 
      createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      'geoData.country': { $exists: true, $ne: null }
    }},
    { $group: {
      _id: '$geoData.country',
      countryCode: { $first: '$geoData.countryCode' },
      sessions: { $sum: 1 },
      visitors: { $addToSet: '$visitorId' }
    }},
    { $project: {
      _id: 0,
      country: '$_id',
      countryCode: 1,
      sessions: 1,
      visitors: { $size: '$visitors' }
    }},
    { $sort: { sessions: -1 } },
    { $limit: 15 }
  ]);
};

const getDeviceStats = async (dateRange) => {
  return Analytics.aggregate([
    { $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } },
    { $group: {
      _id: '$device.type',
      sessions: { $sum: 1 },
      avgDuration: { $avg: '$sessionDuration' }
    }},
    { $project: {
      _id: 0,
      type: '$_id',
      sessions: 1,
      percentage: {
        $multiply: [
          { $divide: ['$sessions', { $sum: '$sessions' }] },
          100
        ]
      },
      avgDuration: { $round: ['$avgDuration', 2] }
    }},
    { $sort: { sessions: -1 } }
  ]);
};

const calculateTrends = (current, previous) => {
  if (!previous) return null;

  const trends = {};
  Object.keys(current).forEach(key => {
    const currentVal = current[key];
    const previousVal = previous[key];
    
    if (previousVal !== 0) {
      trends[key] = {
        current: currentVal,
        previous: previousVal,
        change: ((currentVal - previousVal) / previousVal) * 100,
        trend: currentVal > previousVal ? 'up' : currentVal < previousVal ? 'down' : 'same'
      };
    }
  });

  return trends;
};


// Add these to controllers/AnalyticsController.js

// Export Sessions Data
const exportSessionsData = async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await Analytics.find(dateFilter)
      .populate('userId', 'username email')
      .select('-__v -events -pageViews._id -events._id')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(sessions);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=sessions-export.csv');
      return res.send(csvData);
    }

    res.status(200).json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    console.error('Error exporting sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export sessions data'
    });
  }
};

// Export Events Data
const exportEventsData = async (req, res) => {
  try {
    const { format = 'json', startDate, endDate, eventType } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const matchStage = { ...dateFilter };
    if (eventType) {
      matchStage['events.eventName'] = eventType;
    }

    const events = await Analytics.aggregate([
      { $match: matchStage },
      { $unwind: '$events' },
      { $project: {
        sessionId: 1,
        visitorId: 1,
        eventName: '$events.eventName',
        category: '$events.category',
        action: '$events.action',
        label: '$events.label',
        value: '$events.value',
        properties: '$events.properties',
        timestamp: '$events.timestamp',
        page: '$events.page',
        element: '$events.element',
        device: '$device.type',
        browser: '$browser.name',
        country: '$geoData.country',
        createdAt: 1
      }},
      { $sort: { timestamp: -1 } }
    ]);

    if (format === 'csv') {
      const csvData = convertEventsToCSV(events);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=events-export.csv');
      return res.send(csvData);
    }

    res.status(200).json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error exporting events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export events data'
    });
  }
};

// Helper function to convert sessions to CSV
const convertToCSV = (sessions) => {
  const headers = [
    'Session ID',
    'Visitor ID',
    'User ID',
    'IP Address',
    'Country',
    'City',
    'Browser',
    'Device Type',
    'OS',
    'Screen Resolution',
    'Referrer',
    'Landing Page',
    'Session Duration',
    'Page Count',
    'Is Returning',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'Session Start',
    'Session End'
  ];

  const rows = sessions.map(session => [
    session.sessionId,
    session.visitorId,
    session.userId?._id || '',
    session.ipAddress,
    session.geoData?.country || '',
    session.geoData?.city || '',
    session.browser?.name || '',
    session.device?.type || '',
    session.os?.name || '',
    `${session.screenResolution?.width}x${session.screenResolution?.height}`,
    session.referrer || 'direct',
    session.landingPage,
    session.sessionDuration,
    session.pageCount,
    session.isReturning ? 'Yes' : 'No',
    session.utmSource || '',
    session.utmMedium || '',
    session.utmCampaign || '',
    session.createdAt.toISOString(),
    session.sessionEndTime?.toISOString() || ''
  ]);

  return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
};

// Helper function to convert events to CSV
const convertEventsToCSV = (events) => {
  const headers = [
    'Session ID',
    'Visitor ID',
    'Event Name',
    'Category',
    'Action',
    'Label',
    'Value',
    'Page',
    'Element',
    'Device',
    'Browser',
    'Country',
    'Timestamp'
  ];

  const rows = events.map(event => [
    event.sessionId,
    event.visitorId,
    event.eventName,
    event.category || '',
    event.action || '',
    event.label || '',
    event.value || '',
    event.page || '',
    event.element || '',
    event.device || '',
    event.browser || '',
    event.country || '',
    new Date(event.timestamp).toISOString()
  ]);

  return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
};

// Export all methods
module.exports = {
  trackSessionStart,
  trackSessionEnd,
  trackPageView,
  trackPageExit,
  trackEvent,
  trackPerformance,
  getAdvancedDashboardStats,
  getRealTimeStats,
  getUserJourney,
  convertEventsToCSV,
  convertToCSV,
  exportEventsData,
  exportSessionsData

  // Note: exportSessionsData and exportEventsData are commented out since they don't exist yet
};



















// // controllers/AnalyticsController.js
// const Analytics = require('../Model/AnalyticsModel');
// const axios = require('axios');
// const UAParser = require('ua-parser-js');
// const geoip = require('geoip-lite'); // npm install geoip-lite

// // Enhanced IP to Location with multiple fallbacks
// const getEnhancedLocationFromIP = async (ip) => {
//   try {
//     // Clean IP address (remove IPv6 prefix if present)
//     const cleanIP = ip.replace(/^::ffff:/, '');
    
//     // Try multiple services for better accuracy
//     const services = [
//       `http://ip-api.com/json/${cleanIP}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as`,
//       `https://api.ipgeolocation.io/ipgeo?apiKey=YOUR_API_KEY&ip=${cleanIP}`,
//       `https://ipapi.co/${cleanIP}/json/`
//     ];
    
//     for (const service of services) {
//       try {
//         const response = await axios.get(service, { timeout: 5000 });
        
//         if (service.includes('ip-api.com') && response.data.status === 'success') {
//           return {
//             country: response.data.country,
//             region: response.data.regionName,
//             city: response.data.city,
//             timezone: response.data.timezone,
//             latitude: response.data.lat,
//             longitude: response.data.lon,
//             postalCode: response.data.zip,
//             countryCode: response.data.countryCode,
//             regionCode: response.data.region,
//             continent: getContinentFromCountry(response.data.countryCode),
//             isp: response.data.isp,
//             organization: response.data.org
//           };
//         }
        
//         if (service.includes('ipapi.co') && response.data.country_name) {
//           return {
//             country: response.data.country_name,
//             region: response.data.region,
//             city: response.data.city,
//             timezone: response.data.timezone,
//             latitude: response.data.latitude,
//             longitude: response.data.longitude,
//             postalCode: response.data.postal,
//             countryCode: response.data.country_code,
//             regionCode: response.data.region_code,
//             continent: response.data.continent_code
//           };
//         }
//       } catch (error) {
//         continue; // Try next service
//       }
//     }
    
//     // Fallback to geoip-lite
//     const geo = geoip.lookup(cleanIP);
//     if (geo) {
//       return {
//         country: geo.country,
//         region: geo.region,
//         city: geo.city,
//         timezone: geo.timezone,
//         latitude: geo.ll[0],
//         longitude: geo.ll[1],
//         countryCode: geo.country
//       };
//     }
    
//     return {};
//   } catch (error) {
//     console.error('Error getting enhanced location:', error);
//     return {};
//   }
// };

// const getContinentFromCountry = (countryCode) => {
//   const continentMap = {
//     // North America
//     'US': 'NA', 'CA': 'NA', 'MX': 'NA',
//     // Europe
//     'GB': 'EU', 'FR': 'EU', 'DE': 'EU', 'IT': 'EU', 'ES': 'EU',
//     // Asia
//     'CN': 'AS', 'JP': 'AS', 'IN': 'AS', 'KR': 'AS',
//     // Add more as needed
//   };
//   return continentMap[countryCode] || 'Unknown';
// };

// // Enhanced User Agent Parser
// const parseEnhancedUserAgent = (userAgent) => {
//   const parser = new UAParser();
//   const result = parser.setUA(userAgent).getResult();
  
//   return {
//     browser: {
//       name: result.browser.name,
//       version: result.browser.version,
//       major: result.browser.major,
//       engine: result.engine.name
//     },
//     os: {
//       name: result.os.name,
//       version: result.os.version,
//       platform: result.os.name?.toLowerCase().includes('windows') ? 'windows' : 
//                 result.os.name?.toLowerCase().includes('mac') ? 'mac' : 
//                 result.os.name?.toLowerCase().includes('linux') ? 'linux' : 'other'
//     },
//     device: {
//       type: result.device.type || 'desktop',
//       vendor: result.device.vendor,
//       model: result.device.model,
//       mobile: !!result.device.type && result.device.type !== 'desktop'
//     }
//   };
// };

// // Get Network Information (client-side, but we can store it)
// const parseConnectionInfo = (connectionData) => {
//   if (!connectionData) return {};
  
//   return {
//     effectiveType: connectionData.effectiveType,
//     downlink: connectionData.downlink,
//     rtt: connectionData.rtt,
//     saveData: connectionData.saveData
//   };
// };

// // Enhanced Session Tracking
// exports.trackSessionStart = async (req, res) => {
//   try {
//     const {
//       sessionId,
//       visitorId,
//       userAgent,
//       screenResolution,
//       viewportSize,
//       connection,
//       language,
//       referrer,
//       landingPage,
//       urlParams,
//       consentGiven = false,
//       doNotTrack = false
//     } = req.body;

//     // Get client IP address
//     const ipAddress = req.ip || 
//                      req.headers['x-forwarded-for']?.split(',')[0] || 
//                      req.connection.remoteAddress || 
//                      req.socket.remoteAddress;

//     // Enhanced data collection
//     const [locationData, userAgentData] = await Promise.all([
//       getEnhancedLocationFromIP(ipAddress),
//       Promise.resolve(parseEnhancedUserAgent(userAgent))
//     ]);

//     const connectionInfo = parseConnectionInfo(connection);

//     // Check visitor history
//     const visitorSessions = await Analytics.find({ visitorId });
//     const isReturning = visitorSessions.length > 0;
//     const isFirstSession = !isReturning;

//     // Parse UTM parameters and other marketing data
//     const marketingData = extractMarketingData(urlParams, referrer);

//     // Create analytics session
//     const analyticsSession = new Analytics({
//       sessionId,
//       visitorId,
//       ipAddress,
//       userAgent,
//       geoData: locationData,
//       ...userAgentData,
//       screenResolution,
//       viewportSize,
//       connection: connectionInfo,
//       language,
//       referrer,
//       initialReferrer: referrer,
//       landingPage,
//       isReturning,
//       isFirstSession,
//       ...marketingData,
//       consentGiven,
//       doNotTrack,
//       userId: req.user?._id
//     });

//     await analyticsSession.save();

//     res.status(200).json({
//       success: true,
//       message: 'Session tracked successfully',
//       data: {
//         sessionId,
//         visitorId,
//         isReturning
//       }
//     });
//   } catch (error) {
//     console.error('Error tracking session:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to track session',
//       error: error.message
//     });
//   }
// };

// // Enhanced Page View Tracking
// exports.trackPageView = async (req, res) => {
//   try {
//     const { 
//       sessionId, 
//       path, 
//       title, 
//       referrer, 
//       queryParams, 
//       hash,
//       performance 
//     } = req.body;

//     const pageView = {
//       path,
//       title,
//       referrer,
//       queryParams,
//       hash,
//       entryTime: new Date()
//     };

//     const updateData = {
//       $push: { pageViews: pageView },
//       $inc: { pageCount: 1 },
//       $set: { 
//         'performance.domContentLoaded': performance?.domContentLoaded,
//         'performance.windowLoad': performance?.windowLoad
//       }
//     };

//     // Update performance metrics if available
//     if (performance) {
//       updateData.$set = {
//         ...updateData.$set,
//         'performance.ttfb': performance.ttfb,
//         'performance.firstContentfulPaint': performance.firstContentfulPaint,
//         'performance.largestContentfulPaint': performance.largestContentfulPaint,
//         'performance.cumulativeLayoutShift': performance.cumulativeLayoutShift
//       };
//     }

//     await Analytics.findOneAndUpdate(
//       { sessionId },
//       updateData
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Page view tracked successfully'
//     });
//   } catch (error) {
//     console.error('Error tracking page view:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to track page view'
//     });
//   }
// };

// // Track Page Exit (for duration calculation)
// exports.trackPageExit = async (req, res) => {
//   try {
//     const { sessionId, path, duration, scrollDepth } = req.body;

//     await Analytics.findOneAndUpdate(
//       { 
//         sessionId,
//         'pageViews.path': path,
//         'pageViews.exitTime': { $exists: false }
//       },
//       {
//         $set: {
//           'pageViews.$.exitTime': new Date(),
//           'pageViews.$.duration': duration,
//           'pageViews.$.scrollDepth': scrollDepth,
//           'pageViews.$.timeOnPage': duration
//         },
//         $inc: { sessionDuration: duration }
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Page exit tracked successfully'
//     });
//   } catch (error) {
//     console.error('Error tracking page exit:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to track page exit'
//     });
//   }
// };

// // Enhanced Event Tracking
// exports.trackEvent = async (req, res) => {
//   try {
//     const { 
//       sessionId, 
//       eventName, 
//       category, 
//       action, 
//       label, 
//       value, 
//       properties,
//       page,
//       element,
//       coordinates
//     } = req.body;

//     const event = {
//       eventName,
//       category,
//       action,
//       label,
//       value,
//       properties,
//       page,
//       element,
//       coordinates,
//       timestamp: new Date()
//     };

//     // Update engagement metrics based on event type
//     const engagementUpdate = {};
//     switch (eventName) {
//       case 'click':
//         engagementUpdate.$inc = { 'engagement.totalClicks': 1 };
//         break;
//       case 'scroll':
//         engagementUpdate.$inc = { 'engagement.totalScrolls': 1 };
//         break;
//       case 'form_start':
//         engagementUpdate.$inc = { 'engagement.formsStarted': 1 };
//         break;
//       case 'form_complete':
//         engagementUpdate.$inc = { 'engagement.formsCompleted': 1 };
//         break;
//       case 'video_start':
//         engagementUpdate.$inc = { 'engagement.videosStarted': 1 };
//         break;
//       case 'video_complete':
//         engagementUpdate.$inc = { 'engagement.videosCompleted': 1 };
//         break;
//       case 'download':
//         engagementUpdate.$push = { 
//           'engagement.downloads': {
//             file: properties?.file,
//             timestamp: new Date()
//           }
//         };
//         break;
//     }

//     const updateData = {
//       $push: { events: event },
//       ...engagementUpdate
//     };

//     await Analytics.findOneAndUpdate(
//       { sessionId },
//       updateData
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Event tracked successfully'
//     });
//   } catch (error) {
//     console.error('Error tracking event:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to track event'
//     });
//   }
// };

// // Track Performance Metrics
// exports.trackPerformance = async (req, res) => {
//   try {
//     const { sessionId, performanceMetrics } = req.body;

//     await Analytics.findOneAndUpdate(
//       { sessionId },
//       {
//         $set: {
//           performance: performanceMetrics
//         }
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Performance metrics tracked successfully'
//     });
//   } catch (error) {
//     console.error('Error tracking performance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to track performance metrics'
//     });
//   }
// };

// // Track Session End with Enhanced Data
// exports.trackSessionEnd = async (req, res) => {
//   try {
//     const { sessionId, duration, reason = 'normal' } = req.body;

//     await Analytics.findOneAndUpdate(
//       { sessionId },
//       {
//         $set: {
//           sessionDuration: duration,
//           sessionEnded: true,
//           sessionEndTime: new Date()
//         }
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Session end tracked successfully'
//     });
//   } catch (error) {
//     console.error('Error tracking session end:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to track session end'
//     });
//   }
// };

// // Helper function to extract marketing data
// const extractMarketingData = (urlParams, referrer) => {
//   const data = {};
  
//   // UTM Parameters
//   if (urlParams) {
//     data.utmSource = urlParams.utm_source;
//     data.utmMedium = urlParams.utm_medium;
//     data.utmCampaign = urlParams.utm_campaign;
//     data.utmTerm = urlParams.utm_term;
//     data.utmContent = urlParams.utm_content;
//   }
  
//   // Organic search detection
//   if (referrer && !data.utmSource) {
//     const searchEngines = [
//       'google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex'
//     ];
    
//     const referrerHost = new URL(referrer).hostname.toLowerCase();
//     const isSearchEngine = searchEngines.some(engine => 
//       referrerHost.includes(engine)
//     );
    
//     if (isSearchEngine) {
//       data.source = referrerHost;
//       data.medium = 'organic';
//       data.keyword = urlParams?.q || urlParams?.query;
//     } else {
//       data.source = referrerHost;
//       data.medium = 'referral';
//     }
//   } else if (!referrer && !data.utmSource) {
//     data.source = '(direct)';
//     data.medium = '(none)';
//   }
  
//   return data;
// };




// // Add to controllers/AnalyticsController.js

// // Advanced Dashboard Statistics
// exports.getAdvancedDashboardStats = async (req, res) => {
//   try {
//     const { range = '7d', compare = false } = req.query;
    
//     const dateRange = calculateDateRange(range);
//     const previousDateRange = compare ? calculateDateRange(range, true) : null;

//     // Parallel data fetching for better performance
//     const [
//       basicStats,
//       trafficSources,
//       pagePerformance,
//       userBehavior,
//       geographicData,
//       deviceStats,
//       previousPeriodStats
//     ] = await Promise.all([
//       getBasicStats(dateRange),
//       getTrafficSources(dateRange),
//       getPagePerformance(dateRange),
//       getUserBehavior(dateRange),
//       getGeographicData(dateRange),
//       getDeviceStats(dateRange),
//       compare ? getBasicStats(previousDateRange) : Promise.resolve(null)
//     ]);

//     const data = {
//       overview: basicStats,
//       trafficSources,
//       pagePerformance,
//       userBehavior,
//       geographicData,
//       deviceStats,
//       trends: compare ? calculateTrends(basicStats, previousPeriodStats) : null
//     };

//     res.status(200).json({
//       success: true,
//       data
//     });
//   } catch (error) {
//     console.error('Error getting advanced dashboard stats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to load analytics data'
//     });
//   }
// };

// // Real-time Analytics
// exports.getRealTimeStats = async (req, res) => {
//   try {
//     const currentTime = new Date();
//     const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60 * 1000);
//     const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

//     const [
//       activeVisitors,
//       recentPageViews,
//       currentEvents,
//       geographicDistribution
//     ] = await Promise.all([
//       // Active visitors (sessions with activity in last 5 minutes)
//       Analytics.countDocuments({
//         sessionEnded: false,
//         updatedAt: { $gte: fiveMinutesAgo }
//       }),
      
//       // Recent page views
//       Analytics.aggregate([
//         { $match: { updatedAt: { $gte: oneHourAgo } } },
//         { $unwind: '$pageViews' },
//         { $match: { 'pageViews.entryTime': { $gte: oneHourAgo } } },
//         { $group: {
//           _id: '$pageViews.path',
//           title: { $first: '$pageViews.title' },
//           views: { $sum: 1 },
//           lastView: { $max: '$pageViews.entryTime' }
//         }},
//         { $sort: { views: -1 } },
//         { $limit: 10 }
//       ]),
      
//       // Current events
//       Analytics.aggregate([
//         { $match: { 
//           sessionEnded: false,
//           'events.timestamp': { $gte: fiveMinutesAgo }
//         }},
//         { $unwind: '$events' },
//         { $match: { 'events.timestamp': { $gte: fiveMinutesAgo } } },
//         { $group: {
//           _id: '$events.eventName',
//           count: { $sum: 1 }
//         }},
//         { $sort: { count: -1 } }
//       ]),
      
//       // Geographic distribution of active visitors
//       Analytics.aggregate([
//         { $match: { 
//           sessionEnded: false,
//           updatedAt: { $gte: fiveMinutesAgo }
//         }},
//         { $group: {
//           _id: '$geoData.country',
//           count: { $sum: 1 },
//           countryCode: { $first: '$geoData.countryCode' }
//         }},
//         { $sort: { count: -1 } },
//         { $limit: 10 }
//       ])
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         activeVisitors,
//         recentPageViews,
//         currentEvents,
//         geographicDistribution,
//         lastUpdated: new Date()
//       }
//     });
//   } catch (error) {
//     console.error('Error getting real-time stats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to load real-time data'
//     });
//   }
// };

// // User Journey Analysis
// exports.getUserJourney = async (req, res) => {
//   try {
//     const { visitorId, sessionId } = req.query;
    
//     let matchQuery = {};
//     if (visitorId) matchQuery.visitorId = visitorId;
//     if (sessionId) matchQuery.sessionId = sessionId;

//     const userJourney = await Analytics.aggregate([
//       { $match: matchQuery },
//       { $sort: { createdAt: 1 } },
//       { $unwind: '$pageViews' },
//       { $sort: { 'pageViews.entryTime': 1 } },
//       { $group: {
//         _id: '$sessionId',
//         visitorId: { $first: '$visitorId' },
//         sessionStart: { $first: '$createdAt' },
//         sessionEnd: { $first: '$sessionEndTime' },
//         pages: {
//           $push: {
//             path: '$pageViews.path',
//             title: '$pageViews.title',
//             entryTime: '$pageViews.entryTime',
//             exitTime: '$pageViews.exitTime',
//             duration: '$pageViews.duration',
//             scrollDepth: '$pageViews.scrollDepth'
//           }
//         },
//         totalDuration: { $first: '$sessionDuration' },
//         device: { $first: '$device' },
//         location: { $first: '$geoData' }
//       }},
//       { $project: {
//         _id: 0,
//         sessionId: '$_id',
//         visitorId: 1,
//         sessionStart: 1,
//         sessionEnd: 1,
//         pages: 1,
//         totalDuration: 1,
//         device: 1,
//         location: 1,
//         pageCount: { $size: '$pages' }
//       }}
//     ]);

//     res.status(200).json({
//       success: true,
//       data: userJourney
//     });
//   } catch (error) {
//     console.error('Error getting user journey:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to load user journey data'
//     });
//   }
// };

// // Helper Functions
// const calculateDateRange = (range, previous = false) => {
//   const now = new Date();
//   let startDate = new Date();
//   let endDate = now;

//   switch (range) {
//     case '1d':
//       startDate.setDate(now.getDate() - (previous ? 2 : 1));
//       break;
//     case '7d':
//       startDate.setDate(now.getDate() - (previous ? 14 : 7));
//       break;
//     case '30d':
//       startDate.setDate(now.getDate() - (previous ? 60 : 30));
//       break;
//     case '90d':
//       startDate.setDate(now.getDate() - (previous ? 180 : 90));
//       break;
//     default:
//       startDate.setDate(now.getDate() - 7);
//   }

//   if (previous) {
//     endDate = new Date(startDate.getTime());
//     startDate.setDate(startDate.getDate() - (range === '1d' ? 1 : 
//                          range === '7d' ? 7 : 
//                          range === '30d' ? 30 : 90));
//   }

//   return { startDate, endDate };
// };

// const getBasicStats = async (dateRange) => {
//   const sessions = await Analytics.find({
//     createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
//   });

//   const totalSessions = sessions.length;
//   const totalVisitors = new Set(sessions.map(s => s.visitorId)).size;
//   const totalPageViews = sessions.reduce((sum, session) => 
//     sum + (session.pageViews?.length || 0), 0
//   );
  
//   const totalDuration = sessions.reduce((sum, session) => 
//     sum + (session.sessionDuration || 0), 0
//   );
  
//   const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

//   // Calculate bounce rate (sessions with only 1 page view and < 30 seconds)
//   const bouncedSessions = sessions.filter(session => 
//     session.pageViews?.length <= 1 && session.sessionDuration < 30
//   ).length;
  
//   const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

//   return {
//     totalSessions,
//     totalVisitors,
//     totalPageViews,
//     avgSessionDuration: Math.round(avgSessionDuration),
//     bounceRate: Math.round(bounceRate * 100) / 100,
//     pagesPerSession: totalSessions > 0 ? (totalPageViews / totalSessions) : 0
//   };
// };

// const getTrafficSources = async (dateRange) => {
//   return Analytics.aggregate([
//     { $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } },
//     { $group: {
//       _id: {
//         source: { $ifNull: ['$utmSource', '$source'] },
//         medium: { $ifNull: ['$utmMedium', '$medium'] }
//       },
//       sessions: { $sum: 1 },
//       visitors: { $addToSet: '$visitorId' },
//       totalDuration: { $sum: '$sessionDuration' },
//       pageViews: { $sum: { $size: '$pageViews' } }
//     }},
//     { $project: {
//       _id: 0,
//       source: '$_id.source',
//       medium: '$_id.medium',
//       sessions: 1,
//       visitors: { $size: '$visitors' },
//       avgDuration: { $divide: ['$totalDuration', '$sessions'] },
//       pagesPerSession: { $divide: ['$pageViews', '$sessions'] }
//     }},
//     { $sort: { sessions: -1 } }
//   ]);
// };

// const getPagePerformance = async (dateRange) => {
//   return Analytics.aggregate([
//     { $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } },
//     { $unwind: '$pageViews' },
//     { $group: {
//       _id: '$pageViews.path',
//       title: { $first: '$pageViews.title' },
//       views: { $sum: 1 },
//       avgDuration: { $avg: '$pageViews.duration' },
//       avgScrollDepth: { $avg: '$pageViews.scrollDepth' },
//       entries: { $sum: 1 },
//       exits: { 
//         $sum: { 
//           $cond: [{ $ifNull: ['$pageViews.exitTime', false] }, 1, 0] 
//         }
//       }
//     }},
//     { $project: {
//       _id: 0,
//       path: '$_id',
//       title: 1,
//       views: 1,
//       avgDuration: { $round: ['$avgDuration', 2] },
//       avgScrollDepth: { $round: ['$avgScrollDepth', 2] },
//       exitRate: { $multiply: [{ $divide: ['$exits', '$entries'] }, 100] }
//     }},
//     { $sort: { views: -1 } },
//     { $limit: 20 }
//   ]);
// };

// const getUserBehavior = async (dateRange) => {
//   return Analytics.aggregate([
//     { $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } },
//     { $group: {
//       _id: null,
//       totalClicks: { $sum: '$engagement.totalClicks' },
//       totalScrolls: { $sum: '$engagement.totalScrolls' },
//       formsStarted: { $sum: '$engagement.formsStarted' },
//       formsCompleted: { $sum: '$engagement.formsCompleted' },
//       conversionRate: {
//         $avg: {
//           $cond: [
//             { $gt: ['$engagement.formsStarted', 0] },
//             { $divide: ['$engagement.formsCompleted', '$engagement.formsStarted'] },
//             0
//           ]
//         }
//       }
//     }}
//   ]);
// };

// const getGeographicData = async (dateRange) => {
//   return Analytics.aggregate([
//     { $match: { 
//       createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
//       'geoData.country': { $exists: true, $ne: null }
//     }},
//     { $group: {
//       _id: '$geoData.country',
//       countryCode: { $first: '$geoData.countryCode' },
//       sessions: { $sum: 1 },
//       visitors: { $addToSet: '$visitorId' }
//     }},
//     { $project: {
//       _id: 0,
//       country: '$_id',
//       countryCode: 1,
//       sessions: 1,
//       visitors: { $size: '$visitors' }
//     }},
//     { $sort: { sessions: -1 } },
//     { $limit: 15 }
//   ]);
// };

// const getDeviceStats = async (dateRange) => {
//   return Analytics.aggregate([
//     { $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } },
//     { $group: {
//       _id: '$device.type',
//       sessions: { $sum: 1 },
//       avgDuration: { $avg: '$sessionDuration' }
//     }},
//     { $project: {
//       _id: 0,
//       type: '$_id',
//       sessions: 1,
//       percentage: {
//         $multiply: [
//           { $divide: ['$sessions', { $sum: '$sessions' }] },
//           100
//         ]
//       },
//       avgDuration: { $round: ['$avgDuration', 2] }
//     }},
//     { $sort: { sessions: -1 } }
//   ]);
// };

// const calculateTrends = (current, previous) => {
//   if (!previous) return null;

//   const trends = {};
//   Object.keys(current).forEach(key => {
//     const currentVal = current[key];
//     const previousVal = previous[key];
    
//     if (previousVal !== 0) {
//       trends[key] = {
//         current: currentVal,
//         previous: previousVal,
//         change: ((currentVal - previousVal) / previousVal) * 100,
//         trend: currentVal > previousVal ? 'up' : currentVal < previousVal ? 'down' : 'same'
//       };
//     }
//   });

//   return trends;
// };















































// // controllers/AnalyticsController.js
// const Analytics = require('../Model/AnalyticsModel');
// const axios = require('axios');
// const UAParser = require('ua-parser-js');

// // Get location data from IP
// const getLocationFromIP = async (ip) => {
//   try {
//     // Using ipapi.co (free tier available)
//     const response = await axios.get(`https://ipapi.co/${ip}/json/`);
//     return {
//       country: response.data.country_name,
//       region: response.data.region,
//       city: response.data.city,
//       timezone: response.data.timezone
//     };
//   } catch (error) {
//     console.error('Error getting location from IP:', error);
//     return {};
//   }
// };

// // Parse user agent
// const parseUserAgent = (userAgent) => {
//   const parser = new UAParser();
//   const result = parser.setUA(userAgent).getResult();

//   return {
//     browser: {
//       name: result.browser.name,
//       version: result.browser.version
//     },
//     os: {
//       name: result.os.name,
//       version: result.os.version
//     },
//     device: {
//       type: result.device.type || 'desktop',
//       vendor: result.device.vendor,
//       model: result.device.model
//     }
//   };
// };

// exports.trackSessionStart = async (req, res) => {
//   try {
//     const {
//       sessionId,
//       visitorId,
//       userAgent,
//       screenResolution,
//       language,
//       referrer,
//       landingPage,
//       urlParams
//     } = req.body;

//     // Get client IP address
//     const ipAddress = req.headers['x-forwarded-for'] || 
//                      req.connection.remoteAddress || 
//                      req.socket.remoteAddress;

//     // Get location data
//     const locationData = await getLocationFromIP(ipAddress);

//     // Parse user agent
//     const userAgentData = parseUserAgent(userAgent);

//     // Check if this is a returning visitor
//     const existingVisitor = await Analytics.findOne({ visitorId });
//     const isReturning = !!existingVisitor;

//     // Extract UTM parameters
//     const utmParams = {
//       utmSource: urlParams?.utm_source,
//       utmMedium: urlParams?.utm_medium,
//       utmCampaign: urlParams?.utm_campaign,
//       utmTerm: urlParams?.utm_term,
//       utmContent: urlParams?.utm_content
//     };

//     // Create or update analytics session
//     await Analytics.findOneAndUpdate(
//       { sessionId },
//       {
//         sessionId,
//         visitorId,
//         ipAddress,
//         userAgent,
//         ...locationData,
//         ...userAgentData,
//         screenResolution,
//         language,
//         referrer: referrer || 'direct',
//         landingPage,
//         isReturning,
//         ...utmParams,
//         userId: req.user?._id // If user is logged in
//       },
//       { upsert: true, new: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Session tracked successfully'
//     });
//   } catch (error) {
//     console.error('Error tracking session:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to track session'
//     });
//   }
// };

// exports.trackPageView = async (req, res) => {
//   try {
//     const { sessionId, path, title } = req.body;

//     await Analytics.findOneAndUpdate(
//       { sessionId },
//       {
//         $push: {
//           pageViews: {
//             path,
//             title,
//             duration: 0 // Will be updated when user leaves the page
//           }
//         }
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Page view tracked successfully'
//     });
//   } catch (error) {
//     console.error('Error tracking page view:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to track page view'
//     });
//   }
// };

// exports.trackPageDuration = async (req, res) => {
//   try {
//     const { sessionId, path, duration } = req.body;

//     await Analytics.findOneAndUpdate(
//       { sessionId, 'pageViews.path': path },
//       {
//         $set: {
//           'pageViews.$.duration': duration
//         },
//         $inc: { sessionDuration: duration }
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Page duration tracked successfully'
//     });
//   } catch (error) {
//     console.error('Error tracking page duration:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to track page duration'
//     });
//   }
// };

// exports.trackEvent = async (req, res) => {
//   try {
//     const { sessionId, eventName, properties, timestamp } = req.body;

//     // You might want to create a separate Events collection
//     // For now, we'll add to the analytics session
//     await Analytics.findOneAndUpdate(
//       { sessionId },
//       {
//         $push: {
//           events: {
//             eventName,
//             properties,
//             timestamp: new Date(timestamp)
//           }
//         }
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Event tracked successfully'
//     });
//   } catch (error) {
//     console.error('Error tracking event:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to track event'
//     });
//   }
// };

// exports.trackSessionEnd = async (req, res) => {
//   try {
//     const { sessionId, duration } = req.body;

//     await Analytics.findOneAndUpdate(
//       { sessionId },
//       {
//         $set: {
//           sessionDuration: duration
//         }
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Session end tracked successfully'
//     });
//   } catch (error) {
//     console.error('Error tracking session end:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to track session end'
//     });
//   }
// };




// // Add to controllers/AnalyticsController.js

// // Get dashboard statistics
// exports.getDashboardStats = async (req, res) => {
//   try {
//     const { range = '7d' } = req.query;
    
//     // Calculate date range
//     const now = new Date();
//     let startDate = new Date();
    
//     switch (range) {
//       case '1d':
//         startDate.setDate(now.getDate() - 1);
//         break;
//       case '7d':
//         startDate.setDate(now.getDate() - 7);
//         break;
//       case '30d':
//         startDate.setDate(now.getDate() - 30);
//         break;
//       case '90d':
//         startDate.setDate(now.getDate() - 90);
//         break;
//       default:
//         startDate.setDate(now.getDate() - 7);
//     }

//     // Get total visitors
//     const totalVisitors = await Analytics.countDocuments({
//       createdAt: { $gte: startDate }
//     });

//     // Get page views
//     const sessions = await Analytics.find({
//       createdAt: { $gte: startDate }
//     });
//     const pageViews = sessions.reduce((total, session) => 
//       total + (session.pageViews?.length || 0), 0
//     );

//     // Get average session duration
//     const avgSessionDuration = sessions.reduce((total, session) => 
//       total + (session.sessionDuration || 0), 0
//     ) / (sessions.length || 1);

//     // Get top pages
//     const pageStats = {};
//     sessions.forEach(session => {
//       session.pageViews?.forEach(page => {
//         pageStats[page.path] = pageStats[page.path] || { title: page.title, views: 0 };
//         pageStats[page.path].views++;
//       });
//     });
//     const topPages = Object.entries(pageStats)
//       .map(([path, data]) => ({ path, ...data }))
//       .sort((a, b) => b.views - a.views)
//       .slice(0, 10);

//     // Get visitors by country
//     const countryStats = await Analytics.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: startDate },
//           country: { $exists: true, $ne: null }
//         }
//       },
//       {
//         $group: {
//           _id: '$country',
//           visitors: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           name: '$_id',
//           visitors: 1,
//           _id: 0
//         }
//       },
//       { $sort: { visitors: -1 } },
//       { $limit: 10 }
//     ]);

//     // Get device distribution
//     const deviceStats = await Analytics.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: startDate },
//           'device.type': { $exists: true }
//         }
//       },
//       {
//         $group: {
//           _id: '$device.type',
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           type: '$_id',
//           count: 1,
//           _id: 0
//         }
//       }
//     ]);

//     // Calculate device percentages
//     const totalDevices = deviceStats.reduce((sum, device) => sum + device.count, 0);
//     const devices = {};
//     deviceStats.forEach(device => {
//       devices[device.type] = Math.round((device.count / totalDevices) * 100);
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         totalVisitors,
//         pageViews,
//         avgSessionDuration,
//         bounceRate: 35, // You'll need to calculate this based on your definition
//         topPages,
//         topCountries: countryStats,
//         devices,
//         // Add comparison data for changes (you'll need to calculate these)
//         visitorChange: 12,
//         pageViewChange: 8,
//         durationChange: 5,
//         bounceRateChange: -3
//       }
//     });
//   } catch (error) {
//     console.error('Error getting dashboard stats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to load analytics data'
//     });
//   }
// };

