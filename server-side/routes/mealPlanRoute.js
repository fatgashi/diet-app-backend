const express = require("express");
const mealPlan = require("../controllers/mealPlanController");

const mealPlanRoutes = express.Router();

mealPlanRoutes.post("/", mealPlan.addMealPlan);
mealPlanRoutes.get("/:id", mealPlan.getMealPlan);

module.exports = mealPlanRoutes;