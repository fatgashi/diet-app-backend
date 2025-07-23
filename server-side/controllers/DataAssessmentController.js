const DietAssessment = require("../models/DietAssessmentSchema");
const generateDietPdf = require("../services/generateDietPdf");
const path = require('path');
const fs = require('fs');
const { sendPersonalizedDietEmail } = require("../services/emailService");


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

    getAssessmentByIdForAdmin: async (req, res) => {
        try {
            const { id } = req.params;

            const assessment = await DietAssessment.findById(id).populate('user', 'name email');

            if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
            }

            res.json(assessment);
        } catch (err) {
            console.error('Admin assessment fetch error:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    writeStructuredDietPlan: async (req, res) => {
        try {
            const { id } = req.params;
            const plan = req.body.plan;

            if (!plan || typeof plan !== 'object') {
            return res.status(400).json({ message: "Invalid or empty diet plan" });
            }

            await DietAssessment.findByIdAndUpdate(
            id,
            {
                dietPlan: plan,
                completed: true,
                updatedAt: new Date()
            },
            { new: true }
            );

            const updated = await DietAssessment.findById(id).populate('user', 'name email');

            if (!updated) {
            return res.status(404).json({ message: "Assessment not found" });
            }

            const outputDir = path.join(__dirname, '../pdfs');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
            
            const outputPath = path.join(outputDir, `diet_${updated._id}.pdf`);
            await generateDietPdf(updated, outputPath);

            // await sendPersonalizedDietEmail(
            //     updated.user.email,
            //     updated.user.name,
            //     outputPath
            // );

            res.json({ success: true, message: "Diet plan saved successfully" });
        } catch (err) {
            console.error("Write diet plan error:", err);
            res.status(500).json({ message: "Server error" });
        }
    },

    downloadDietPlanPdf: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const assessment = await DietAssessment.findOne({ _id: id, user: userId });

            if (!assessment) {
            return res.status(403).json({ message: 'Unauthorized' });
            }

            const filePath = path.join(__dirname, '../pdfs', `diet_${id}.pdf`);

            if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'PDF not found.' });
            }

            res.download(filePath, `diet_${id}.pdf`);
        } catch (err) {
            console.error('PDF Download Error:', err);
            res.status(500).json({ message: 'Server error.' });
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
        const { answers } = req.body;
        
        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ message: 'Invalid or missing answers' });
        }

        try {
            const user = req.user;

            const dataDiet = new DietAssessment({
                user: user._id,
                answers
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
    },

    getPaidIncompleteAssessments: async (req, res) => {
        try {
            const { startDate, endDate, completed, page = 1, limit = 10 } = req.query;

            const filter = {
                paid: true
            };

            if (completed === 'true') {
                filter.completed = true;
            } else if (completed === 'false') {
                filter.completed = false;
            }

            if (startDate || endDate) {
                filter.date = {};
                if (startDate) filter.date.$gte = new Date(startDate);
                if (endDate) filter.date.$lte = new Date(endDate);
            }

            const assessments = await DietAssessment.find(filter)
            .populate('user', 'name email') // include basic user info
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));


            const total = await DietAssessment.countDocuments(filter);

            res.json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            data: assessments
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    getLastAssessment: async (req,res) => {
        try {
            const user = req.user;

            const getDietAssessment = await DietAssessment.find({user: user._id}).sort({date: -1}).limit(1);

            if(getDietAssessment.length !== 1){
                return res.status(404).json("You don't have enough data yet!");
            }

            res.json(getDietAssessment);
            
        } catch (error) {
            return res.status(500).json({ message: '"Internal Server Error!"' });
        }
    }
}

module.exports = DataAssessment;