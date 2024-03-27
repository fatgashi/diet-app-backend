const express = require('express');
const predictionsRoute = express.Router();
const predictionsController = require('../controllers/predictionsController')

predictionsRoute.post("/", predictionsController.getPredictions);

module.exports = predictionsRoute;