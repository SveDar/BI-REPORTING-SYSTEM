var express = require('express');
var env = require('dotenv').config()
var ejs = require('ejs');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

mongoose.connect('mongodb+srv://svetlodar98d:xWATYzhInHnWR26G@cluster0.wciaafk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB connection : ' + err);
  }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});











const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { exec } = require('child_process');
const WebSocket = require('ws');



const WSPORT = 3001;

app.use(express.static('public'));
app.use(express.json());

const data = [];
const uniqueValues = {
  CPF_RequestStatus: new Set(),
  CPF_CreditProduct_Approved: new Set(),
  CPH_NewClient: new Set(),
  APP_IsRefinance: new Set(),
  CPF_IsRefinanced: new Set(),
  APP_AddressRegion: new Set()
};



// Read the CSV file and store the data
fs.createReadStream('Data_Sample.csv')
  .pipe(csv())
  .on('data', (row) => {
    data.push(row);
    // Collect unique values for each filter
    uniqueValues.CPF_RequestStatus.add(row.CPF_RequestStatus);
    uniqueValues.CPF_CreditProduct_Approved.add(row.CPF_CreditProduct_Approved);
    uniqueValues.CPH_NewClient.add(row.CPH_NewClient);
    uniqueValues.APP_IsRefinance.add(row.APP_IsRefinance);
    uniqueValues.CPF_IsRefinanced.add(row.CPF_IsRefinanced);
    uniqueValues.APP_AddressRegion.add(row.APP_AddressRegion);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

// Endpoint to get unique filter values
app.get('/filters', (req, res) => {
  res.json({
    CPF_RequestStatus: Array.from(uniqueValues.CPF_RequestStatus),
    CPF_CreditProduct_Approved: Array.from(uniqueValues.CPF_CreditProduct_Approved),
    CPH_NewClient: Array.from(uniqueValues.CPH_NewClient),
    APP_IsRefinance: Array.from(uniqueValues.APP_IsRefinance),
    CPF_IsRefinanced: Array.from(uniqueValues.CPF_IsRefinanced),
    APP_AddressRegion: Array.from(uniqueValues.APP_AddressRegion)
  });
  console.log('filters.');
});


// WebSocket server for notifications
const wss = new WebSocket.Server({ port: WSPORT });

function notifyClients(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Filter data and save the filtered data to a new CSV file
app.post('/filter', (req, res) => {
  const filters = req.body;
  const minAmount = parseFloat(filters.CPF_LoanAmount_Approved_Min) || -Infinity;
  const maxAmount = parseFloat(filters.CPF_LoanAmount_Approved_Max) || Infinity;
  const dateBegin = filters.DateBegin ? new Date(filters.DateBegin) : new Date(-8640000000000000); // Min date
  const dateEnd = filters.DateEnd ? new Date(filters.DateEnd) : new Date(8640000000000000); // Max date

  const filteredData = data.filter(row => {
    const loanAmount = parseFloat(row.CPF_LoanAmount_Approved);
    const applicationDate = new Date(row.APP_ApplicationDate);

    // First, check if the loan amount is within the specified range
    if (loanAmount < minAmount || loanAmount > maxAmount) {
      return false;
    }

    // Then, check if the application date is within the specified range
    if (applicationDate < dateBegin || applicationDate > dateEnd) {
      return false;
    }

    // Then, check other filters
    return Object.entries(filters).every(([key, value]) => {
      if (key === 'CPF_LoanAmount_Approved_Min' || key === 'CPF_LoanAmount_Approved_Max' || key === 'DateBegin' || key === 'DateEnd') return true; // Skip range keys
      if (!value) return true; // If filter is empty, include the row
      if (key === 'CPF_LoanAmount_Approved') return true; // Already checked above
      return row[key] === value;
    });
  });

  // Define the CSV writer
  const csvWriter = createCsvWriter({
    path: 'filtered_data.csv',
    header: Object.keys(data[0]).map(key => ({ id: key, title: key }))
  });

  // Write the filtered data to the CSV file
  csvWriter.writeRecords(filteredData)
    .then(() => {
      console.log('Filtered data written to filtered_data.csv');


      
      // flag a value to the file
      fs.writeFile("views/public/csv_collection/flag.txt", "0", (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Value written to file successfully!');
        }
      });

      // Execute cashflow.js after writing the filtered data
      exec('node cashflow.js', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing cashflow.js: ${error}`);
          return res.status(500).send('Error executing cashflow.js');
        }
        console.log(`cashflow.js output: ${stdout}`);

        // Execute applications.js after cashflow.js
        exec('node applications.js', (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing applications.js: ${error}`);
            return res.status(500).send('Error executing applications.js');
          }
          console.log(`applications.js output: ${stdout}`);

          // Execute contract.js after applications.js
          exec('node contract.js', (error, stdout, stderr) => {
            if (error) {
              console.error(`Error executing contract.js: ${error}`);
              return res.status(500).send('Error executing contract.js');
            }
            console.log(`contract.js output: ${stdout}`);

            // Execute customer_behavior.js after contract.js
            exec('node customer_behavior.js', (error, stdout, stderr) => {
              if (error) {
                console.error(`Error executing customer_behavior.js: ${error}`);
                return res.status(500).send('Error executing customer_behavior.js');
              }
              console.log(`customer_behavior.js output: ${stdout}`);

              // Execute geo_report.js after customer_behavior.js
              exec('node geo_report.js', (error, stdout, stderr) => {
                if (error) {
                  console.error(`Error executing geo_report.js: ${error}`);
                  return res.status(500).send('Error executing geo_report.js');
                }
                console.log(`geo_report.js output: ${stdout}`);
                // Notify clients and send response
                notifyClients('All processes completed successfully');
                res.json({ message: 'All processes completed successfully' });

                // flag a value to the file
                fs.writeFile("views/public/csv_collection/flag.txt", "1", (err) => {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log('Value written to file successfully!');
                  }
                });
              });
            });
          });
        });
      });

/////////////////////

    })
    .catch(err => {
      console.error('Error writing to CSV file', err);
      res.status(500).send('Error writing to CSV file');
    });
});

// Endpoint to get output text
app.get('/output-text', (req, res) => {
  fs.readFile('CSVRAG/output.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading output.txt', err);
      return res.status(500).send('Error reading output.txt');
    }
    res.send(data);
  });
});



















app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');	

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/views'));

var index = require('./routes/index');
app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});







const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('Server is started on http://localhost:'+PORT);
});