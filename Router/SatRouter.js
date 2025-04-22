const express = require('express');
const SatRouter = express.Router();
const SatController = require('../Controller/SatController');

// SAT registration routes
SatRouter.post('/register', SatController.registerForSAT);
SatRouter.get('/registrations', SatController.getSATRegistrations);

module.exports = SatRouter; 