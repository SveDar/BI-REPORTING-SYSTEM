const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const filteredData = [];
const results = {};

fs.createReadStream('filtered_data.csv')
  .pipe(csv())
  .on('data', (row) => {
    const region = row.APP_AddressRegion;
    if (!results[region]) {
      results[region] = {
        region: region,
        good: 0,
        bad: 0,
        goodRate: 0,
        badRate: 0,
        grantedAmount: 0,
        repaidAmount: 0,
        badCount: 0,
        ntu: 0,
        accept: 0,
        reject: 0,
        ntuCount: 0,
        acceptCount: 0,
        rejectCount: 0,
        totalCount: 0
      };
    }
    if (row.Bad === '0') results[region].good += 1;
    if (row.Bad === '1') results[region].bad += 1;
    results[region].grantedAmount += parseFloat(row.CPF_LoanAmount_Approved);
    results[region].repaidAmount += parseFloat(row.CPF_RepaidAmount);
    results[region].badCount += 1;
    if (row.CPF_RequestStatus === 'NTU') results[region].ntu += 1;
    if (row.CPF_RequestStatus === 'ACCEPT') results[region].accept += 1;
    if (row.CPF_RequestStatus === 'REJECT') results[region].reject += 1;
    results[region].ntuCount += 1;
    results[region].acceptCount += 1;
    results[region].rejectCount += 1;
    results[region].totalCount += 1;
  })
  .on('end', () => {
    const outputData = Object.values(results).map(item => {
      item.goodRate = item.good / item.totalCount;
      item.badRate = item.bad / item.totalCount;
      item.ntuRate = item.ntu / item.totalCount;
      item.acceptRate = item.accept / item.totalCount;
      item.rejectRate = item.reject / item.totalCount;
      item.badRate = item.bad / item.badCount;
      return item;
    });

    const csvWriter = createCsvWriter({
      path: 'views/public/csv_collection/geo_report.csv',
      header: [
        { id: 'region', title: 'Region' },
        { id: 'good', title: 'Good' },
        { id: 'goodRate', title: 'Good_%' },
        { id: 'bad', title: 'Bad' },
        { id: 'badRate', title: 'Bad_%' },
        { id: 'grantedAmount', title: 'Granted_Amount' },
        { id: 'repaidAmount', title: 'Repaid_Amount' },
        { id: 'ntu', title: 'NTU' },
        { id: 'ntuRate', title: 'NTU_%' },
        { id: 'accept', title: 'Accept' },
        { id: 'acceptRate', title: 'Accept_%' },
        { id: 'reject', title: 'Reject' },
        { id: 'rejectRate', title: 'Reject_%' }
      ]
    });

    csvWriter.writeRecords(outputData)
      .then(() => {
        console.log('Geo report data written to geo_report.csv');
      })
      .catch(err => {
        console.error('Error writing to geo_report.csv', err);
      });
  });
