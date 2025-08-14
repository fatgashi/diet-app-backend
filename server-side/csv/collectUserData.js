const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

// Define file path inside the project
const filePath = path.join(__dirname, '../data/questionnaire_responses.csv');

// Ensure the directory exists
const ensureDirectoryExistence = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Define headers
const HEADERS = [
  'Group_Age',
  'Gender',
  'Current_Body_Type',
  'Desired_Body_Type',
  'Goals',
  'Target_Zones',
  'Last_Time_Happy_With_Weight',
  'Breakfast_Timing',
  'Lunch_Timing',
  'Dinner_Timing',
  'Cooking_Preference',
  'Feelings_About_Fasting',
  'Activity_Level',
  'Workout_Frequency',
  'Workload',
  'Work_Activity_Level',
  'Interests',
  'Breathlessness_After_Stairs',
  'Walking_Time_Per_Day',
  'Water_Intake',
  'Average_Night_Sleep',
  'Health_Conditions',
  'Medication',
  'Back_Problems',
  'Bad_Habits',
  'Knowledge_About_Intermittent_Fasting',
  'Excitement_About_Weight_Loss',
  'Height',
  'Current_Weight',
  'Perfect_Weight',
  'Age',
  'Assessment_ID',
  'Diet_Type'
];

function writeTransformedDataToCSV(transformedData) {
  ensureDirectoryExistence(filePath);

  const fileExists = fs.existsSync(filePath);
  const ws = fs.createWriteStream(filePath, { flags: 'a' });

  ws.on('finish', () => {
    // console.log('Write complete');
  });

  csv
    .write([transformedData], {
      headers: !fileExists ? HEADERS : false,
      includeEndRowDelimiter: true
    })
    .pipe(ws);
}

module.exports = writeTransformedDataToCSV;