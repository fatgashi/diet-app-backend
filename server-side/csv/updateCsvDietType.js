const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const csvPath = path.join(__dirname, '../data/questionnaire_responses.csv');

// Function to fix malformed CSV data
async function fixCSVData() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(csvPath)) {
      return resolve();
    }

    try {
      const fileContent = fs.readFileSync(csvPath, 'utf8');
      const lines = fileContent.split('\n');
      const fixedLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          // Check if line has proper CSV structure (should have 32 commas for 33 columns)
          const commaCount = (line.match(/,/g) || []).length;
          if (commaCount === 32) {
            fixedLines.push(line);
          } else {
            console.warn(`Skipping malformed line ${i + 1}: ${line.substring(0, 100)}...`);
          }
        }
      }

      if (fixedLines.length > 0) {
        const backupPath = csvPath + '.backup';
        fs.writeFileSync(backupPath, fileContent); // Create backup
        fs.writeFileSync(csvPath, fixedLines.join('\n') + '\n');
        console.log(`CSV file fixed. Backup created at ${backupPath}`);
      }
      resolve();
    } catch (error) {
      console.error('Error fixing CSV:', error);
      reject(error);
    }
  });
}

// Utility function to check if assessment exists in CSV
async function checkAssessmentInCSV(assessmentId) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(csvPath)) {
      return resolve(false);
    }

    let found = false;
    fs.createReadStream(csvPath)
      .pipe(csv.parse({ headers: true }))
      .on('error', reject)
      .on('data', row => {
        if (row.Assessment_ID === assessmentId) {
          found = true;
        }
      })
      .on('end', () => resolve(found));
  });
}

// Utility function to validate CSV data
function validateCSVRow(row) {
  const requiredFields = ['Assessment_ID'];
  for (const field of requiredFields) {
    if (!row[field]) {
      return false;
    }
  }
  return true;
}

async function updateDietTypeInCSV(assessmentId, newDietType) {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate inputs
      if (!assessmentId || !newDietType) {
        return reject(new Error('Assessment ID and diet type are required'));
      }

      // Check if CSV file exists
      if (!fs.existsSync(csvPath)) {
        return reject(new Error('CSV file not found'));
      }

      // Try to fix CSV data first
      try {
        await fixCSVData();
      } catch (fixError) {
        console.warn('Could not fix CSV data:', fixError.message);
        // Continue anyway
      }

      const rows = [];
      let foundAssessment = false;
      const tempPath = csvPath + '.tmp';

      fs.createReadStream(csvPath)
        .pipe(csv.parse({ headers: true }))
        .on('error', (error) => {
          console.error('CSV parsing error:', error);
          reject(error);
        })
        .on('data', row => {
          // Validate row data
          if (!validateCSVRow(row)) {
            console.warn('Invalid CSV row found:', row);
            return; // Skip invalid rows
          }

          if (row.Assessment_ID === assessmentId) {
            row.Diet_Type = newDietType;
            foundAssessment = true;
          }
          rows.push(row);
        })
        .on('end', () => {
          if (!foundAssessment) {
            console.warn(`Assessment ID ${assessmentId} not found in CSV`);
            // Still resolve but log warning
          }

          // Write to temporary file first to avoid file locking issues
          const ws = fs.createWriteStream(tempPath);
          csv.write(rows, { headers: true })
            .pipe(ws)
            .on('error', (error) => {
              console.error('CSV writing error:', error);
              reject(error);
            })
            .on('finish', () => {
              // Replace original file with temporary file
              fs.rename(tempPath, csvPath, (error) => {
                if (error) {
                  console.error('File rename error:', error);
                  // Try to clean up temp file
                  fs.unlink(tempPath, () => {});
                  reject(error);
                } else {
                  console.log(`Successfully updated diet type for assessment ${assessmentId}`);
                  resolve();
                }
              });
            });
        });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  updateDietTypeInCSV,
  checkAssessmentInCSV,
  fixCSVData
};