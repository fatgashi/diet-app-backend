const DietAssessment = require("../models/DietAssessmentSchema");
const Diet = require("../models/DietTypeSchema");
const MealPlan = require("../models/MealPlanSchema");


const mealPlan = {
    addMealPlan: async (req,res) => {
        try {
            const { dietType, week, days,  } = req.body
    
            const dietTypeId = Diet.findById(dietType);
    
            if(!dietTypeId) {
                return res.status(404).send("Diet Type not found!");
            }
    
            const mealPlan = new MealPlan({
                dietType,
                week,
                days
            })
    
            await mealPlan.save();
    
            res.status(201).send("Meal Plan added successfully! ");
        } catch (err) {
            res.status(500).send("Internal Server Error!")
        }
    },

    getMealPlan: async (req,res) => {
        try {
            const { id } = req.params;
    
            const data = await MealPlan.find({dietType: id});
    
            if(!data.length) return res.status(404).send("Meal Plan not found!");
    
            res.send(data);
            
        } catch (error) {
            res.status(500).send("Internal Server Error!");
        }
    },

    getMealPlanByUser: async (req, res) => {
        try {
            const user = req.user;
    
            // Find the user's diet assessment and ensure it is awaited and properly handled
            const userDiet = await DietAssessment.findOne({ user: user._id }).sort({ date: -1 });
    
            if (!userDiet) {
                return res.status(404).send("You do not have a diet yet!");
            }
    
            // Find the diet associated with the user's diet assessment
            const diet = await Diet.findOne({ type: userDiet.dietType });
    
            if (!diet) {
                return res.status(404).send("Diet not found!");
            }
    
            // Determine today's day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
            const today = new Date().getDay();
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const todayString = daysOfWeek[today];
    
            // Find the meal plan associated with the found diet and today's day
            const mealPlan = await MealPlan.findOne({ dietType: diet._id, 'days.day': todayString });
    
            if (!mealPlan) {
                return res.status(404).send("Meal plan not found for today!");
            }
    
            // Extract the meals for today
            const todayMeals = mealPlan.days.find(day => day.day === todayString);
    
            if (!todayMeals || todayMeals.meals.length === 0) {
                return res.status(404).send("No meals found for today!");
            }
    
            res.json(todayMeals.meals);
    
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal Server Error!");
        }
    }
}

module.exports = mealPlan