const express = require('express');
const csvParser = require('csv-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
})); // Enable CORS


// Define an API endpoint for parsing CSV files
app.get('/parse-csv/:buttonValue', (req, res) => {
  const buttonValue = req.params.buttonValue;

  // Assuming your CSV files are located in a directory named 'client/src/data/asn/'
  const csvDirectory = './src/data/asn/';

  // Build the path to the CSV file based on the button value
  const csvFilePath = csvDirectory + buttonValue + '.csv';

  // Check if the CSV file exists
  if (fs.existsSync(csvFilePath)) {
    const parsedData = [];

    // Read the CSV file and parse its contents
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (data) => {
        // Fix the date by adding one day
        const date = new Date(data.date);
        date.setDate(date.getDate() + 1);
        data.date = date.toISOString().split('T')[0]; // Convert back to string format 'YYYY-MM-DD'
        parsedData.push(data);
      })
      .on('end', () => {
        // Process the parsed data or perform any additional operations
        console.log(parsedData);

        // Return the parsed data as a response
        res.json(parsedData);
      });
  } else {
    // If the CSV file doesn't exist, return an error response
    res.status(404).json({ error: 'CSV file not found' });
  }
});

// Define the route to handle data requests for a specific ASN
app.get('/api/asndata/:asnId', (req, res) => {
  const asnId = req.params.asnId;

  const csvDirectory = './src/data/asn/';
  const csvFilePath = csvDirectory + asnId + '.csv';

  const data = [];
  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on('data', (row) => {
      const date = new Date(row.date);
      date.setDate(date.getDate() + 1); // Adding +1 day to the date

      // Update the date in the row object
      row.date = date.toISOString(); // Assuming you want to use the ISO string format

      data.push(row);
    })
    .on('end', () => {
      res.json(data);
    })
    .on('error', (error) => {
      console.error(error);
      res.status(500).send('Failed to fetch data for ASN: ' + asn);
    });
});


// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
