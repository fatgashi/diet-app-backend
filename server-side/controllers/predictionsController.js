const axios = require('axios');
const transformUserInputToModelFormat = require('../models/userInputFormat');


const Predictions = {
    getPredictions: async (req,res) => {
        const userInput = req.body;

        const data = transformUserInputToModelFormat(userInput)
        console.log(data);

        try {
            const response = await axios.post('http://localhost:5000', data);
            res.send(response.data); // Send the prediction back to the frontend
        } catch (error) {
            console.error('Error calling Python API:', error.message);
            res.status(500).send({error: 'Internal Server Error'});
        }

    }
}

module.exports = Predictions