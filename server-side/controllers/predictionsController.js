const axios = require('axios');
const transformUserInputToModelFormat = require('../models/userInputFormatForPrediction');
const writeTransformedDataToCSV = require('../csv/collectUserData');
const transformUserInputToWrite = require('../models/FormatDataToWrite');


const Predictions = {
    getPredictions: async (req,res) => {
        const userInput = req.body;

        const transformedData = transformUserInputToModelFormat(userInput);
        const data = transformUserInputToWrite(userInput)
        writeTransformedDataToCSV(data);

        try {
            const response = await axios.post('http://localhost:5000', transformedData);
            res.send(response.data); // Send the prediction back to the frontend
        } catch (error) {
            console.error('Error calling Python API:', error.message);
            res.status(500).send({error: 'Internal Server Error'});
        }

    }
}

module.exports = Predictions