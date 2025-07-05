const express = require('express');
const DataAssessment = require('../controllers/DataAssessmentController');
const dietAssessmentRoute = express.Router();
const passport = require('passport')

dietAssessmentRoute.get("/", passport.authenticate('jwt', { session: false }), DataAssessment.getDataAssessmentFromUser);
dietAssessmentRoute.post("/addDietAssessment", passport.authenticate('jwt', { session: false }), DataAssessment.addDataAssessmentFromUser);
dietAssessmentRoute.get("/getTwoLastAssessment", passport.authenticate('jwt', { session: false }), DataAssessment.getTwoLastAssessments);
dietAssessmentRoute.get('/details/:id', passport.authenticate('jwt', { session: false }), DataAssessment.getDietAssessmentDetails);
dietAssessmentRoute.delete('/diet/:id', passport.authenticate('jwt', { session: false }), DataAssessment.deleteAssessment);

module.exports = dietAssessmentRoute;