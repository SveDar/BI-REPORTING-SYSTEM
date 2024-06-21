const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const filteredData = [];
const dailyContracts = {};
const periodContracts = {
  openedContractRate: 0,
  closedContractRate: 0,
  refinancedRate: 0,
  paidOffRate: 0,
  cessionRate: 0,
  courtRate: 0
};

fs.createReadStream('filtered_data.csv')
  .pipe(csv())
  .on('data', (row) => {
    filteredData.push(row);
    const date = row.APP_ApplicationDate;

    if (!dailyContracts[date]) {
      dailyContracts[date] = {
        date: date,
        openedContractRate: 0,
        closedContractRate: 0,
        refinancedRate: 0,
        paidOffRate: 0,
        cessionRate: 0,
        courtRate: 0
      };
    }

    dailyContracts[date].openedContractRate += row.CPF_RequestStatus === 'ACCEPT' ? 1 : 0;
    dailyContracts[date].openedContractRate -= row.CPF_RequestStatus === 'NTU' ? 1 : 0;

    dailyContracts[date].refinancedRate += row.CPF_IsRefinanced === '1' ? 1 : 0;
    dailyContracts[date].paidOffRate += row.CPF_PaidOff === '1' ? 1 : 0;
    dailyContracts[date].cessionRate += row.CPF_Cession === '1' ? 1 : 0;
    dailyContracts[date].courtRate += row.CPF_Court === '1' ? 1 : 0;

    dailyContracts[date].closedContractRate =
      dailyContracts[date].refinancedRate +
      dailyContracts[date].paidOffRate +
      dailyContracts[date].cessionRate +
      dailyContracts[date].courtRate;

    // Update period contracts
    periodContracts.openedContractRate += row.CPF_RequestStatus === 'ACCEPT' ? 1 : 0;
    periodContracts.openedContractRate -= row.CPF_RequestStatus === 'NTU' ? 1 : 0;
    periodContracts.refinancedRate += row.CPF_IsRefinanced === '1' ? 1 : 0;
    periodContracts.paidOffRate += row.CPF_PaidOff === '1' ? 1 : 0;
    periodContracts.cessionRate += row.CPF_Cession === '1' ? 1 : 0;
    periodContracts.courtRate += row.CPF_Court === '1' ? 1 : 0;
  })
  .on('end', () => {
    periodContracts.closedContractRate =
      periodContracts.refinancedRate +
      periodContracts.paidOffRate +
      periodContracts.cessionRate +
      periodContracts.courtRate;

    const dailyCsvWriter = createCsvWriter({
      path: 'views/public/csv_collection/contract.csv',
      header: [
        { id: 'date', title: 'date' },
        { id: 'openedContractRate', title: 'Opened_Contract_Rate' },
        { id: 'closedContractRate', title: 'Closed_Contract_Rate' },
        { id: 'refinancedRate', title: 'Refinanced_Rate' },
        { id: 'paidOffRate', title: 'Paid_off_Rate' },
        { id: 'cessionRate', title: 'Cession_Rate' },
        { id: 'courtRate', title: 'Court_Rate' }
      ]
    });

    const periodCsvWriter = createCsvWriter({
      path: 'views/public/csv_collection/contract_per_period.csv',
      header: [
        { id: 'openedContractRate', title: 'Opened_Contract_Rate' },
        { id: 'closedContractRate', title: 'Closed_Contract_Rate' },
        { id: 'refinancedRate', title: 'Refinanced_Rate' },
        { id: 'paidOffRate', title: 'Paid-off_Rate' },
        { id: 'cessionRate', title: 'Cession_Rate' },
        { id: 'courtRate', title: 'Court_Rate' }
      ]
    });

    // Write daily contracts data
    dailyCsvWriter.writeRecords(Object.values(dailyContracts))
      .then(() => {
        console.log('Daily contracts data written to contract.csv');
      })
      .catch(err => {
        console.error('Error writing to contract.csv', err);
      });

    // Write period contracts data
    periodCsvWriter.writeRecords([periodContracts])
      .then(() => {
        console.log('Period contracts data written to contract_per_period.csv');
      })
      .catch(err => {
        console.error('Error writing to contract_per_period.csv', err);
      });
  });
