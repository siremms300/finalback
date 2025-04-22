const express = require('express');
const WebinarRouter = express.Router();
const WebinarController = require('../Controller/WebinarController');

// Webinar registration route
WebinarRouter.post('/register', WebinarController.registerForWebinar);
WebinarRouter.get('/registrations', WebinarController.getWebinarRegistrations);

module.exports = WebinarRouter;