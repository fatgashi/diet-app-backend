const express = require('express');
const DataAssessment = require('../controllers/DataAssessmentController');
const dietAssessmentRoute = express.Router();
const passport = require('passport')

dietAssessmentRoute.get("/", passport.authenticate('jwt', { session: false }), DataAssessment.getDataAssessmentFromUser);

module.exports = dietAssessmentRoute;