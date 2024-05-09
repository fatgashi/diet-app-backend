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
            const response = await axios.post('http://127.0.0.1:5000', transformedData);
            res.send(response.data);
        } catch (error) {
            console.log('Error calling Python API:', error.message);
            res.status(500).send('Internal Server Error');
        }

    }
}

module.exports = Predictions