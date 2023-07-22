// parserUtils.js
import csvParser from 'csv-parser';
import fs from 'fs';

// Function to parse the CSV file based on the button value
export function parseCSV(buttonValue) {
  // Assuming your CSV files are located in a directory named 'csvFiles'
  const csvDirectory = './data/asn/';

  // Build the path to the CSV file based on the button value
  const csvFilePath = csvDirectory + buttonValue + '.csv';

  // Check if the CSV file exists
  if (fs.existsSync(csvFilePath)) {
    const parsedData = [];

    // Read the CSV file and parse its contents
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (data) => {
        parsedData.push(data);
      })
      .on('end', () => {
        // Process the parsed data or perform any additional operations
        console.log(parsedData);
        // Here, you can write the parsed data to another CSV file if needed

        // Return the parsed data
        return parsedData;
      });
  } else {
    // If the CSV file doesn't exist, handle the error accordingly
    console.error('CSV file does not exist.');
    return null;
  }
}
