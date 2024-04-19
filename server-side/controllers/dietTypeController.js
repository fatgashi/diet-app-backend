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
    },

    getDietType: async (req,res) => {
        try {
            const { type } = req.params

            const data = await Diet.find({type: type.trim()});

            if(!data.length){
                return res.status(404).send("Diet Type not Found !");
            }

            res.send(data);
        } catch (error) {
            res.status(500).send(error);
        }
    }
}

module.exports = dietType;