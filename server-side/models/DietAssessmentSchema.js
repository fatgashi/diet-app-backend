const mongoose = require('mongoose');
const { Schema } = mongoose;

const DietAssessmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  answers: { type: Map, of: String, required: true },
  dietType: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DietAssessment = mongoose.model('DietAssessment', DietAssessmentSchema);

module.exports = DietAssessment;