const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnswerSchema = new Schema({
  question: {
      en: String,
      de: String
  },
  answer: Schema.Types.Mixed
}, { _id: false });

const DietAssessmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  answers: [AnswerSchema],
  dietType: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DietAssessment = mongoose.model('DietAssessment', DietAssessmentSchema);

module.exports = DietAssessment;