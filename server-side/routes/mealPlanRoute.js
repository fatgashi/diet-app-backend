const express = require("express");
const mealPlan = require("../controllers/mealPlanController");
const passport = require("passport");

const mealPlanRoutes = express.Router();

mealPlanRoutes.post("/", mealPlan.addMealPlan);
mealPlanRoutes.get("/getMealPlanByUser", passport.authenticate('jwt', { session: false }), mealPlan.getMealPlanByUser);
mealPlanRoutes.get("/:id", mealPlan.getMealPlan);

module.exports = mealPlanRoutes;