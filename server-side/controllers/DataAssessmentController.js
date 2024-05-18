const DietAssessment = require("../models/DietAssessmentSchema");


const DataAssessment = {
    getDataAssessmentFromUser: async (req,res) => {
        try {
            const user = req.user;

            const dataDiet = await DietAssessment.find({user: user._id}).sort({date: -1});
            
            res.json(dataDiet);
        } catch (error) {
            res.json("Internal Server Error!");
        }
    }
}

module.exports = DataAssessment;