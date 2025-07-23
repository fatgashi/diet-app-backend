const express = require('express');
const DataAssessment = require('../controllers/DataAssessmentController');
const dietAssessmentRoute = express.Router();
const passport = require('passport');
const { isAdmin } = require('../middleware/authorization');

dietAssessmentRoute.get("/", passport.authenticate('jwt', { session: false }), DataAssessment.getDataAssessmentFromUser);
dietAssessmentRoute.post("/addDietAssessment", passport.authenticate('jwt', { session: false }), DataAssessment.addDataAssessmentFromUser);
dietAssessmentRoute.get("/paid-assessments", isAdmin, DataAssessment.getPaidIncompleteAssessments);
dietAssessmentRoute.get("/getTwoLastAssessment", passport.authenticate('jwt', { session: false }), DataAssessment.getTwoLastAssessments);
dietAssessmentRoute.get("/lastAssessment", passport.authenticate('jwt', { session: false }), DataAssessment.getLastAssessment);
dietAssessmentRoute.get('/admin/:id', isAdmin, DataAssessment.getAssessmentByIdForAdmin);
dietAssessmentRoute.get('/download-pdf/:id', passport.authenticate('jwt', { session: false }), DataAssessment.downloadDietPlanPdf);
dietAssessmentRoute.put('/write-plan/:id', isAdmin, DataAssessment.writeStructuredDietPlan);
dietAssessmentRoute.get('/details/:id', passport.authenticate('jwt', { session: false }), DataAssessment.getDietAssessmentDetails);
dietAssessmentRoute.delete('/diet/:id', passport.authenticate('jwt', { session: false }), DataAssessment.deleteAssessment);

module.exports = dietAssessmentRoute;