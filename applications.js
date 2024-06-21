const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const filteredData = [];
const dailyApplications = {};
const periodApplications = {
  REJECT: 0,
  APPLICANT: 0,
  APPROVED: 0,
  NTU: 0,
  ACCEPT: 0,
};

fs.createReadStream('filtered_data.csv')
  .pipe(csv())
  .on('data', (row) => {
    filteredData.push(row);
    const date = row.APP_ApplicationDate;

    if (!dailyApplications[date]) {
      dailyApplications[date] = {
        date: date,
        REJECT: 0,
        APPLICANT: 0,
        APPROVED: 0,
        NTU: 0,
        ACCEPT: 0,
      };
    }

    if (row.CPF_RequestStatus === 'REJECT') dailyApplications[date].REJECT++;
    if (row.CPF_RequestStatus !== 'CANCEL') dailyApplications[date].APPLICANT++;
    if (row.CPF_RequestStatus === 'ACCEPT' || row.CPF_RequestStatus === 'NTU') dailyApplications[date].APPROVED++;
    if (row.CPF_RequestStatus === 'NTU') dailyApplications[date].NTU++;
    if (row.CPF_RequestStatus === 'ACCEPT') dailyApplications[date].ACCEPT++;

    // Update period applications
    if (row.CPF_RequestStatus === 'REJECT') periodApplications.REJECT++;
    if (row.CPF_RequestStatus !== 'CANCEL') periodApplications.APPLICANT++;
    if (row.CPF_RequestStatus === 'ACCEPT' || row.CPF_RequestStatus === 'NTU') periodApplications.APPROVED++;
    if (row.CPF_RequestStatus === 'NTU') periodApplications.NTU++;
    if (row.CPF_RequestStatus === 'ACCEPT') periodApplications.ACCEPT++;
  })
  .on('end', () => {
    const dailyCsvWriter = createCsvWriter({
      path: 'views/public/csv_collection/applications.csv',
      header: [
        { id: 'date', title: 'date' },
        { id: 'REJECT', title: 'REJECT' },
        { id: 'APPLICANT', title: 'APPLICANT' },
        { id: 'APPROVED', title: 'APPROVED' },
        { id: 'NTU', title: 'NTU' },
        { id: 'ACCEPT', title: 'ACCEPT' }
      ]
    });

    const periodCsvWriter = createCsvWriter({
      path: 'views//csv_collection/applications_per_period.csv',
      header: [
        { id: 'REJECT', title: 'REJECT' },
        { id: 'APPLICANT', title: 'APPLICANT' },
        { id: 'APPROVED', title: 'APPROVED' },
        { id: 'NTU', title: 'NTU' },
        { id: 'ACCEPT', title: 'ACCEPT' }
      ]
    });

    const periodRateCsvWriter = createCsvWriter({
      path: 'views/public/csv_collection/applications_rate_per_period.csv',
      header: [
        { id: 'rejectRate', title: 'Reject_rate' },
        { id: 'acceptRate', title: 'Accept_rate' },
        { id: 'contractRate', title: 'Contract_rate' },
        { id: 'refinancingRate', title: 'Refinancing_rate' },
        { id: 'newContractRate', title: 'New_Contract_rate' },
        { id: 'ntuRate', title: 'NTU_rate' }
      ]
    });

    const dailyRateCsvWriter = createCsvWriter({
      path: 'views/public/csv_collection/applications_rate.csv',
      header: [
        { id: 'date', title: 'date' },
        { id: 'rejectRate', title: 'Reject_rate' },
        { id: 'acceptRate', title: 'Accept_rate' },
        { id: 'contractRate', title: 'Contract_rate' },
        { id: 'refinancingRate', title: 'Refinancing_rate' },
        { id: 'newContractRate', title: 'New_Contract_rate' },
        { id: 'ntuRate', title: 'NTU_rate' }
      ]
    });

    const periodRates = {
      rejectRate: periodApplications.APPLICANT ? periodApplications.REJECT / periodApplications.APPLICANT : 0,
      acceptRate: periodApplications.APPLICANT ? periodApplications.APPROVED / periodApplications.APPLICANT : 0,
      contractRate: periodApplications.APPLICANT ? periodApplications.ACCEPT / periodApplications.APPLICANT : 0,
      refinancingRate: periodApplications.APPLICANT ? periodApplications.NTU / periodApplications.APPLICANT : 0,
      newContractRate: periodApplications.APPLICANT ? (periodApplications.APPROVED - periodApplications.NTU) / periodApplications.APPLICANT : 0,
      ntuRate: periodApplications.APPLICANT ? periodApplications.NTU / periodApplications.APPLICANT : 0
    };

    const dailyRates = Object.entries(dailyApplications).map(([date, stats]) => ({
      date,
      rejectRate: stats.APPLICANT ? stats.REJECT / stats.APPLICANT : 0,
      acceptRate: stats.APPLICANT ? stats.APPROVED / stats.APPLICANT : 0,
      contractRate: stats.APPLICANT ? stats.ACCEPT / stats.APPLICANT : 0,
      refinancingRate: stats.APPLICANT ? stats.NTU / stats.APPLICANT : 0,
      newContractRate: stats.APPLICANT ? (stats.APPROVED - stats.NTU) / stats.APPLICANT : 0,
      ntuRate: stats.APPLICANT ? stats.NTU / stats.APPLICANT : 0
    }));

    // Write daily applications data
    dailyCsvWriter.writeRecords(Object.values(dailyApplications))
      .then(() => {
        console.log('Daily applications data written to applications.csv');
      })
      .catch(err => {
        console.error('Error writing to applications.csv', err);
      });

    // Write period applications data
    periodCsvWriter.writeRecords([periodApplications])
      .then(() => {
        console.log('Period applications data written to applications_per_period.csv');
      })
      .catch(err => {
        console.error('Error writing to applications_per_period.csv', err);
      });

    // Write period rate applications data
    periodRateCsvWriter.writeRecords([periodRates])
      .then(() => {
        console.log('Period applications rate data written to applications_rate_per_period.csv');
      })
      .catch(err => {
        console.error('Error writing to applications_rate_per_period.csv', err);
      });

    // Write daily rate applications data
    dailyRateCsvWriter.writeRecords(dailyRates)
      .then(() => {
        console.log('Daily applications rate data written to applications_rate.csv');
      })
      .catch(err => {
        console.error('Error writing to applications_rate.csv', err);
      });
  });
