const { updateDietTypeInCSV, checkAssessmentInCSV } = require('./updateCsvDietType');
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../data/questionnaire_responses.csv');

async function testCSVUpdate() {
  try {
    console.log('=== CSV Update Test ===');
    
    // Check if CSV file exists
    if (!fs.existsSync(csvPath)) {
      console.error('CSV file not found at:', csvPath);
      return;
    }
    
    console.log('CSV file found at:', csvPath);
    
    // Read and display first few lines
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n');
    console.log(`Total lines in CSV: ${lines.length}`);
    
    console.log('\nFirst 3 lines:');
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      console.log(`Line ${i + 1}: ${lines[i].substring(0, 100)}...`);
    }
    
    // Test with a sample assessment ID
    const testAssessmentId = '6880dc208bf0a5721f66b1b3';
    const testDietType = 'Test Diet Type';
    
    console.log(`\nTesting with Assessment ID: ${testAssessmentId}`);
    
    // Check if assessment exists
    const exists = await checkAssessmentInCSV(testAssessmentId);
    console.log(`Assessment exists in CSV: ${exists}`);
    
    // Try to update
    console.log('\nAttempting to update CSV...');
    await updateDietTypeInCSV(testAssessmentId, testDietType);
    console.log('CSV update successful!');
    
  } catch (error) {
    console.error('Test failed with error:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
testCSVUpdate();
