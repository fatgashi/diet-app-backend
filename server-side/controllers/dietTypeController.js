const Diet = require("../models/DietTypeSchema");


const dietType = {
    addDietType: async (req,res) => {
        try {
            const { type, description, benefits, idealFor, restrictions } = req.body;
            const newDietType = new Diet({
                type,
                description,
                benefits,
                idealFor,
                restrictions
            });
    
            await newDietType.save();
    
            res.status(201).send("Diet Created Successfully!");

        } catch(err){
            res.status(500).send("Internal Server Error!");
        }
    }
}

module.exports = dietType;