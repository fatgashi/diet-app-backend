const mongoose = require('mongoose');
const { Schema } = mongoose;

const MealSchema = new Schema({
  name: { type: String, required: true }, // e.g., Breakfast, Lunch, Dinner
  description: { type: String, required: true },
  ingredients: [String], // List of ingredients needed
  preparation: { type: String, required: true } // Instructions for preparation
});

const MealPlanSchema = new Schema({
  dietType: { type: Schema.Types.ObjectId, ref: 'Diet', required: true },
  week: { type: Number, required: true }, // Week number for the plan
  days: [{
    day: { type: String, required: true }, // e.g., Monday, Tuesday
    meals: [MealSchema] // Embedded sub-document for meals
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MealPlan = mongoose.model('MealPlan', MealPlanSchema);

module.exports = MealPlan;