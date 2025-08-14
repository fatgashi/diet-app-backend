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
  paid: { type: Boolean, default: false },
  dietType: { type: String, default: null }, // Not required anymore
  dietPlan: {
    dietType: { type: String, default: '' },
    summary: { type: String, default: '' },
    calories: { type: String, default: '' },
    macros: {
      carbs: { type: String, default: '' },
      protein: { type: String, default: '' },
      fats: { type: String, default: '' }
    },
    fastingWindow: { type: String, default: '' },
    meals: {
      breakfast: { type: String, default: '' },
      lunch: { type: String, default: '' },
      dinner: { type: String, default: '' }
    },
    weeklyMeals: {
      monday:   { breakfast: {type:String, default:''}, lunch: {type:String, default:''}, dinner: {type:String, default:''} },
      tuesday:  { breakfast: {type:String, default:''}, lunch: {type:String, default:''}, dinner: {type:String, default:''} },
      wednesday:{ breakfast: {type:String, default:''}, lunch: {type:String, default:''}, dinner: {type:String, default:''} },
      thursday: { breakfast: {type:String, default:''}, lunch: {type:String, default:''}, dinner: {type:String, default:''} },
      friday:   { breakfast: {type:String, default:''}, lunch: {type:String, default:''}, dinner: {type:String, default:''} },
      saturday: { breakfast: {type:String, default:''}, lunch: {type:String, default:''}, dinner: {type:String, default:''} },
      sunday:   { breakfast: {type:String, default:''}, lunch: {type:String, default:''}, dinner: {type:String, default:''} }
    },
    workouts: { type: String, default: '' },
    lifestyle: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DietAssessment = mongoose.model('DietAssessment', DietAssessmentSchema);

module.exports = DietAssessment;
