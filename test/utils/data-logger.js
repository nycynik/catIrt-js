const fs = require('fs');
const path = require('path');

/* DataLogger
** added to make it easier to view the output
*/
class DataLogger {
    constructor(headers, filename = 'output.csv') {
        this.headers = headers;
        this.data = [];
        
        // Create output directory if it doesn't exist
        const outputDir = 'output';
        if (!fs.existsSync(outputDir)) {
            console.log('📁 Creating output directory...');
            fs.mkdirSync(outputDir);
        }
  
        // Setup CSV file stream in the output directory
        const filepath = path.join(outputDir, filename);
        console.log(`📝 Writing to ${filepath}`);
        this.csvStream = fs.createWriteStream(filepath);
        this.csvStream.write(headers.join(',') + '\n');
    }
  
    logRow(rowData) {
        // Save to array for console.table later
        this.data.push(rowData);
        
        // Write to CSV
        const csvLine = this.headers
            .map(header => rowData[header])
            .join(',');
        this.csvStream.write(csvLine + '\n');
  
        // Print formatted console output
        //console.table([rowData]);
    }
  
    finish() {
        this.csvStream.end();
        console.log('✅ Data logging complete!');
    }
  }

  module.exports = DataLogger;