const express = require('express');
const UniversityWebinarRouter = express.Router();
const UniversityWebinarController = require('../Controller/UniversityWebinarController');

// Webinar registration route
UniversityWebinarRouter.post('/registeruniversitywebinar', UniversityWebinarController.registerForUniversityWebinar);
UniversityWebinarRouter.get('/registrationsforuniversity', UniversityWebinarController.getUniversityWebinarRegistrations);

module.exports = UniversityWebinarRouter; 


// registerForUniversityWebinar
// getUniversityWebinarRegistrations