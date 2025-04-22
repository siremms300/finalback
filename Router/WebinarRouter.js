const express = require('express');
const WebinarRouter = express.Router();
const webinarController = require('../Controller/WebinarController');

// Webinar registration route
WebinarRouter.post('/register', webinarController.registerForWebinar);
WebinarRouter.get('/registrations', webinarController.getWebinarRegistrations);

module.exports = WebinarRouter;