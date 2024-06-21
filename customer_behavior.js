const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const filteredData = [];
const dailyBehavior = {};
const periodBehavior = {
  Good: 0,
  Bad: 0,
};

// Read the filtered data CSV
fs.createReadStream('filtered_data.csv')
  .pipe(csv())
  .on('data', (row) => {
    filteredData.push(row);
    const date = row.APP_ApplicationDate;
    const isBad = parseInt(row.Bad);

    if (!dailyBehavior[date]) {
      dailyBehavior[date] = {
        date: date,
        Good: 0,
        Bad: 0,
      };
    }

    if (isBad === 0) dailyBehavior[date].Good++;
    if (isBad === 1) dailyBehavior[date].Bad++;

    // Update period behavior
    if (isBad === 0) periodBehavior.Good++;
    if (isBad === 1) periodBehavior.Bad++;
  })
  .on('end', () => {
    const dailyCsvWriter = createCsvWriter({
      path: 'views/public/csv_collection/customer_behavior.csv',
      header: [
        { id: 'date', title: 'Date' },
        { id: 'Good', title: 'Good' },
        { id: 'Bad', title: 'Bad' },
        { id: 'GoodRate', title: 'Good_rate' },
        { id: 'BadRate', title: 'Bad_rate' }
      ]
    });

    const periodCsvWriter = createCsvWriter({
      path: 'views/public/csv_collection/customer_behavior_per_period.csv',
      header: [
        { id: 'Good', title: 'Good' },
        { id: 'Bad', title: 'Bad' },
        { id: 'GoodRate', title: 'Good_rate' },
        { id: 'BadRate', title: 'Bad_rate' }
      ]
    });

    const dailyRates = Object.entries(dailyBehavior).map(([date, stats]) => ({
      date,
      Good: stats.Good,
      Bad: stats.Bad,
      GoodRate: (stats.Good + stats.Bad) ? stats.Good / (stats.Good + stats.Bad) : 0,
      BadRate: (stats.Good + stats.Bad) ? stats.Bad / (stats.Good + stats.Bad) : 0
    }));

    const periodRates = {
      Good: periodBehavior.Good,
      Bad: periodBehavior.Bad,
      GoodRate: (periodBehavior.Good + periodBehavior.Bad) ? periodBehavior.Good / (periodBehavior.Good + periodBehavior.Bad) : 0,
      BadRate: (periodBehavior.Good + periodBehavior.Bad) ? periodBehavior.Bad / (periodBehavior.Good + periodBehavior.Bad) : 0
    };

    // Write daily behavior data
    dailyCsvWriter.writeRecords(dailyRates)
      .then(() => {
        console.log('Daily customer behavior data written to customer_behavior.csv');
      })
      .catch(err => {
        console.error('Error writing to customer_behavior.csv', err);
      });

    // Write period behavior data
    periodCsvWriter.writeRecords([periodRates])
      .then(() => {
        console.log('Period customer behavior data written to customer_behavior_per_period.csv');
      })
      .catch(err => {
        console.error('Error writing to customer_behavior_per_period.csv', err);
      });
  });
