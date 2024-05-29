const express = require('express');
const StatisticsController = require('../controllers/statisticsController');
const { isAdmin } = require('../middleware/authorization');
const statisticsRoute = express.Router();

statisticsRoute.get("/countUsers", isAdmin, StatisticsController.countUsers);
statisticsRoute.get("/countSuspendedUsers", isAdmin, StatisticsController.countSuspendedUsers);

module.exports = statisticsRoute;