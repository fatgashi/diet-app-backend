const DietAssessment = require("../models/DietAssessmentSchema");


const DataAssessment = {
    getDataAssessmentFromUser: async (req,res) => {
        try {
            const user = req.user;

            const dataDiet = await DietAssessment.find({user: user._id}).sort({date: -1});

            if(!dataDiet){
                return res.status(404).json("You haven't completed a questionnaire yet!");
            }
            
            res.json(dataDiet);
        } catch (error) {
            res.json("Internal Server Error!");
        }
    },

    getDietAssessmentDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const assessment = await DietAssessment.findOne({ _id: id, user: userId });

            if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found.' });
            }

            res.json(assessment);
        } catch (err) {
            console.error('Assessment Fetch Error:', err);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    deleteAssessment: async (req, res) => {
        try {
            const userId = req.user.id;
            const assessmentId = req.params.id;

            const assessment = await DietAssessment.findOne({ _id: assessmentId, user: userId });

            if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found.' });
            }

            if (assessment.paid) {
                return res.status(403).json({ message: 'Cannot delete a paid assessment.' });
            }

            await DietAssessment.deleteOne({ _id: assessmentId });

            res.json({ message: 'Assessment deleted successfully.' });
        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({ message: 'Server error while deleting assessment.' });
        }
    },

    addDataAssessmentFromUser: async (req,res) => {
        const { answers, dietType } = req.body;

        try {
            const user = req.user;

            const lastDiet = await DietAssessment.findOne({ user: user._id }).sort({ date: -1 });

            if (lastDiet) {
                const lastDietDate = new Date(lastDiet.date);
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

                if (lastDietDate >= oneMonthAgo) {
                    return res.status(400).json({ message: 'You can only add a new DataAssessment if the last one is over a month old!' });
                }
            }

            const dataDiet = new DietAssessment({
                user: user._id,
                answers,
                dietType
            });

            await dataDiet.save();
            return res.status(201).json({ message: 'DataAssessment added successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    },

    getTwoLastAssessments: async (req,res) => {
        try {
            const user = req.user;
    
            const getDietAssessment = await DietAssessment.find({user: user._id}).sort({date: -1}).limit(2);
    
            if(getDietAssessment.length !== 2){
                return res.status(404).json("You don't have enough data yet!");
            }

            res.json(getDietAssessment);
            
        } catch (error) {
            return res.status(500).json({ message: '"Internal Server Error!"' });
        }
    }
}

module.exports = DataAssessment;