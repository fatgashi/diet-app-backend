const Diet = require("../models/DietTypeSchema");


const dietType = {
    addDietType: async (req,res) => {
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
    }
}

module.exports = dietType;