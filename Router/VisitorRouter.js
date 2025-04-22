const express = require('express');
const VisitorRouter = express.Router();
const visitorController = require('../Controller/VisitorController');

// Webinar registration route
VisitorRouter.post('/register', visitorController.visitorRegister);
VisitorRouter.get('/registrations', visitorController.getVisitorRegistrations);

module.exports = VisitorRouter;