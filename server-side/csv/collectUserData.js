const fs = require('fs');
const csv = require('fast-csv');

function writeTransformedDataToCSV(transformedData) {
    // Create a write stream to the file
    const ws = fs.createWriteStream('C:/Users/Dell/Desktop/questionnaire_responses.csv', {flags: "a"});

    ws.on('finish', () => {
        // console.log('Successfully wrote to the CSV file.');
    });
    // Write the transformed data to the CSV file
    // fast-csv will convert the array of objects to CSV format
    csv.write([transformedData], { headers: !fs.existsSync('C:/Users/Dell/Desktop/questionnaire_responses.csv'), includeEndRowDelimiter: true  }).pipe(ws);
    // console.log(transformedData);
}

module.exports = writeTransformedDataToCSV;