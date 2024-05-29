const User = require("../models/UserSchema")


const StatisticsController = {
    countUsers: async (req,res) => {
        try {
            const countClients = await User.countDocuments({role: "client"});

            const countAdmin = await User.countDocuments({role: "admin"});
            
            res.json({countClients, countAdmin});

        } catch (error) {
            res.status(500).json({message: "Internal Server Error!"});
        }
    },

    countSuspendedUsers: async (req,res) => {
        try {
            const countSusUsers = await User.countDocuments({suspended: true});

            const countNonSusUsers = await User.countDocuments({suspended: false});

            res.json({countNonSusUsers, countSusUsers});
            
        } catch (error) {
            res.status(500).json({message: "Internal Server Error!"});

        }
    }
}

module.exports = StatisticsController