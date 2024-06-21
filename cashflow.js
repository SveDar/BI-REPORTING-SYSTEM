const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const filteredData = [];
const dailyCashflow = {};
const periodCashflow = {
  nCases: 0,
  lendedAmount: 0,
  repaidAmount: 0,
  lockedAmount: 0
};

fs.createReadStream('filtered_data.csv')
  .pipe(csv())
  .on('data', (row) => {
    filteredData.push(row);
    const date = row.APP_ApplicationDate;

    if (!dailyCashflow[date]) {
      dailyCashflow[date] = {
        date: date,
        nCases: 0,
        lendedAmount: 0,
        repaidAmount: 0,
        lockedAmount: 0
      };
    }

    dailyCashflow[date].nCases += 1;
    dailyCashflow[date].lendedAmount += parseFloat(row.CPF_LendedAmount);
    dailyCashflow[date].repaidAmount += parseFloat(row.CPF_RepaidAmount);
    dailyCashflow[date].lockedAmount = dailyCashflow[date].lendedAmount - dailyCashflow[date].repaidAmount;

    // Update period cashflow
    periodCashflow.nCases += 1;
    periodCashflow.lendedAmount += parseFloat(row.CPF_LendedAmount);
    periodCashflow.repaidAmount += parseFloat(row.CPF_RepaidAmount);
  })
  .on('end', () => {
    periodCashflow.lockedAmount = periodCashflow.lendedAmount - periodCashflow.repaidAmount;

    const dailyCsvWriter = createCsvWriter({
      path: 'views/public/csv_collection/cashflow.csv',
      header: [
        { id: 'date', title: 'date' },
        { id: 'nCases', title: 'request' },
        { id: 'lendedAmount', title: 'Lended_Amount' },
        { id: 'repaidAmount', title: 'Repaid_Amount' },
        { id: 'lockedAmount', title: 'Locked_Amount' }
      ]
    });

    const periodCsvWriter = createCsvWriter({
      path: 'views/public/csv_collection/cashflow_per_period.csv',
      header: [
        { id: 'nCases', title: 'request' },
        { id: 'lendedAmount', title: 'Lended_Amount' },
        { id: 'repaidAmount', title: 'Repaid_Amount' },
        { id: 'lockedAmount', title: 'Locked_Amount' }
      ]
    });

    // Write daily cashflow data
    dailyCsvWriter.writeRecords(Object.values(dailyCashflow))
      .then(() => {
        console.log('Daily cashflow data written to cashflow.csv');
      })
      .catch(err => {
        console.error('Error writing to cashflow.csv', err);
      });

    // Write period cashflow data
    periodCsvWriter.writeRecords([periodCashflow])
      .then(() => {
        console.log('Period cashflow data written to cashflow_per_period.csv');
      })
      .catch(err => {
        console.error('Error writing to cashflow_per_period.csv', err);
      });
  });
