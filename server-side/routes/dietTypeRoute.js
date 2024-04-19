const express = require('express');
const dietType = require('../controllers/dietTypeController');
const dietTypesRoute = express.Router();

dietTypesRoute.post("/", dietType.addDietType);
dietTypesRoute.get("/:type", dietType.getDietType);

module.exports = dietTypesRoute;