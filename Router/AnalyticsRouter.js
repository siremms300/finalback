// routes/AnalyticsRouter.js
const express = require('express');
const AnalyticsRouter = express.Router();
const AnalyticsController = require('../Controller/AnalyticsController'); // Fix path
const { authenticateUser } = require('../middleware/UserAuthenticationMiddleware');

// Public tracking endpoints
AnalyticsRouter.post('/session/start', AnalyticsController.trackSessionStart);
AnalyticsRouter.post('/session/end', AnalyticsController.trackSessionEnd);
AnalyticsRouter.post('/pageview', AnalyticsController.trackPageView);
AnalyticsRouter.post('/page-exit', AnalyticsController.trackPageExit);
AnalyticsRouter.post('/event', AnalyticsController.trackEvent);
AnalyticsRouter.post('/performance', AnalyticsController.trackPerformance);

// Analytics dashboard endpoints (protected)
AnalyticsRouter.get('/dashboard/advanced', authenticateUser, AnalyticsController.getAdvancedDashboardStats);
AnalyticsRouter.get('/dashboard/realtime', authenticateUser, AnalyticsController.getRealTimeStats);
AnalyticsRouter.get('/user-journey', authenticateUser, AnalyticsController.getUserJourney);

// Comment out non-existent export endpoints for now
AnalyticsRouter.get('/export/sessions', authenticateUser, AnalyticsController.exportSessionsData);
AnalyticsRouter.get('/export/events', authenticateUser, AnalyticsController.exportEventsData);

module.exports = AnalyticsRouter;
























// // routes/AnalyticsRouter.js
//  const express = require('express');
// const AnalyticsRouter = express.Router();
// const AnalyticsController = require('../Controller/AnalyticsController');
// const { authenticateUser } = require('../middleware/UserAuthenticationMiddleware');


// // Public tracking endpoints
// AnalyticsRouter.post('/session/start', AnalyticsController.trackSessionStart);
// AnalyticsRouter.post('/session/end', AnalyticsController.trackSessionEnd);
// AnalyticsRouter.post('/pageview', AnalyticsController.trackPageView);
// AnalyticsRouter.post('/page-exit', AnalyticsController.trackPageExit);
// AnalyticsRouter.post('/event', AnalyticsController.trackEvent);
// AnalyticsRouter.post('/performance', AnalyticsController.trackPerformance);

// // Analytics dashboard endpoints (protected)
// AnalyticsRouter.get('/dashboard/advanced', authenticateUser, AnalyticsController.getAdvancedDashboardStats);
// AnalyticsRouter.get('/dashboard/realtime', authenticateUser, AnalyticsController.getRealTimeStats);
// AnalyticsRouter.get('/user-journey', authenticateUser, AnalyticsController.getUserJourney);

// // Export endpoints
// AnalyticsRouter.get('/export/sessions', authenticateUser, AnalyticsController.exportSessionsData);
// AnalyticsRouter.get('/export/events', authenticateUser, AnalyticsController.exportEventsData);

// module.exports = AnalyticsRouter;










































// // routes/AnalyticsRouter.js
// const express = require('express');
// const AnalyticsRouter = express.Router();
// const AnalyticsController = require('../Controller/AnalyticsController');
// const { authenticateUser } = require('../middleware/UserAuthenticationMiddleware');

// // Public tracking endpoints
// AnalyticsRouter.post('/session/start', AnalyticsController.trackSessionStart);
// AnalyticsRouter.post('/session/end', AnalyticsController.trackSessionEnd);
// AnalyticsRouter.post('/pageview', AnalyticsController.trackPageView);
// AnalyticsRouter.post('/page-duration', AnalyticsController.trackPageDuration);
// AnalyticsRouter.post('/event', AnalyticsController.trackEvent);
// AnalyticsRouter.get('/dashboard', authenticateUser, AnalyticsController.getDashboardStats);

// module.exports = AnalyticsRouter;

