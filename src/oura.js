const { log } = require('console');
var http = require('http');
const { type } = require('os');
const Client = require('oura-cloud-api');

async function getOuraData(accessToken) {
  const client = new Client(accessToken);

  const dailyReadinessRawData = await client.getDailyReadiness({
    start_date: getWeekAgoDate(),
    end_date: getTodayDate(),
  });

  const dailySleepRawData = await client.getDailySleep({
    start_date: getWeekAgoDate(),
    end_date: getTodayDate(),
  });

  const dataDailyReadiness = getScoreByData(dailyReadinessRawData, 'readiness');

  const dataDailyHrvBalance = getScoreByData(
    dailyReadinessRawData,
    'hrv_balance',
    (item) => item.contributors.hrv_balance
  );

  const dataDailySleep = getScoreByData(dailySleepRawData, 'sleep');

  return mergeObjects(dataDailyReadiness, dataDailyHrvBalance, dataDailySleep);
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekAgoDate() {
  var date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().slice(0, 10);
}

function getScoreByData(data, key, field = 'score') {
  function getValueByField(item) {
    if (typeof field === 'function') {
      return field(item);
    }
    return item[field];
  }

  return data.data
    .map((item) => ({
      day: item.day,
      value: getValueByField(item),
    }))
    .reduce((acc, item) => {
      acc[item.day] = { [key]: item.value };
      return acc;
    }, {});
}

function mergeObjects(...objs) {
  const keys = Object.keys(objs[0]);

  return keys.reduce((acc, key) => {
    acc[key] = objs.reduce((obj, item) => {
      return { ...obj, ...item[key] };
    }, {});
    return acc;
  }, {});
}

module.exports = { getOuraData };
