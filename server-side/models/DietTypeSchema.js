const mongoose = require('mongoose');
const { Schema } = mongoose;

const DietSchema = new Schema({
  type: { type: String, unique: true, required: true }, // e.g., Keto, Vegan
  description: { type: String, required: true },
  benefits: [String], // List of health benefits
  idealFor: [String], // Conditions or goals this diet is ideal for
  restrictions: [String], // List of food restrictions or allergies accommodated
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Diet = mongoose.model('Diet', DietSchema);

module.exports = Diet;