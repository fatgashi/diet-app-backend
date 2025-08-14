const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../data/questionnaire_responses.csv');

function fixCSVFile() {
  try {
    if (!fs.existsSync(csvPath)) {
      console.log('CSV file not found');
      return;
    }

    console.log('Reading CSV file...');
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    
    // Create backup
    const backupPath = csvPath + '.backup.' + Date.now();
    fs.writeFileSync(backupPath, fileContent);
    console.log(`Backup created at: ${backupPath}`);

    // Split into lines and fix
    const lines = fileContent.split('\n');
    const fixedLines = [];
    
    console.log(`Processing ${lines.length} lines...`);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Count commas to check if line has proper CSV structure
        const commaCount = (line.match(/,/g) || []).length;
        
        if (commaCount === 32) {
          // Valid line with 33 columns (32 commas)
          fixedLines.push(line);
        } else {
          console.warn(`Line ${i + 1} has ${commaCount} commas (expected 32): ${line.substring(0, 100)}...`);
          
          // Try to fix by splitting on commas and ensuring we have 33 parts
          const parts = line.split(',');
          if (parts.length >= 33) {
            // Take only the first 33 parts
            const fixedLine = parts.slice(0, 33).join(',');
            fixedLines.push(fixedLine);
            console.log(`Fixed line ${i + 1}`);
          } else {
            console.warn(`Skipping line ${i + 1} - cannot fix`);
          }
        }
      }
    }

    if (fixedLines.length > 0) {
      // Write the fixed content
      const fixedContent = fixedLines.join('\n') + '\n';
      fs.writeFileSync(csvPath, fixedContent);
      console.log(`CSV file fixed. ${fixedLines.length} valid lines written.`);
    } else {
      console.log('No valid lines found to write.');
    }

  } catch (error) {
    console.error('Error fixing CSV file:', error);
  }
}

// Run the fix
fixCSVFile();
