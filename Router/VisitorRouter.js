const express = require('express');
const VisitorRouter = express.Router();
const VisitorController = require('../Controller/VisitorController');

// Webinar registration route
VisitorRouter.post('/register', VisitorController.visitorRegister);
VisitorRouter.get('/registrations', VisitorController.getVisitorRegistrations);

module.exports = VisitorRouter;