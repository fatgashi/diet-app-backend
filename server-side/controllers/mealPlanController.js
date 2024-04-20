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
}

module.exports = mealPlan