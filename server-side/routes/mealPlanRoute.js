const express = require("express");
const mealPlan = require("../controllers/mealPlanController");

const mealPlanRoutes = express.Router();

mealPlanRoutes.post("/", mealPlan.addMealPlan);

module.exports = mealPlanRoutes;