const { log } = require('console');
var http = require('http');
const { type } = require('os');
const Client = require('oura-cloud-api');

const accessToken = 'I5UAHQTSTW76DXV2R3GCDZBDNKXC6CQ6';

const cacheFor = 60 * 60 * 1; // 1 hours

http
  .createServer(async function (req, res) {
    const client = new Client(accessToken);

    const dailyReadinessRawData = await client.getDailyReadiness({
      start_date: getWeekAgoDate(),
      end_date: getTodayDate(),
    });

    const dailySleepRawData = await client.getDailySleep({
      start_date: getWeekAgoDate(),
      end_date: getTodayDate(),
    });

    const dataDailyReadiness = getScoreByData(
      dailyReadinessRawData,
      'readiness'
    );

    const dataDailyHrvBalance = getScoreByData(
      dailyReadinessRawData,
      'hrv_balance',
      (item) => item.contributors.hrv_balance
    );

    const dataDailySleep = getScoreByData(dailySleepRawData, 'sleep');

    const data = mergeObjects(
      dataDailyReadiness,
      dataDailyHrvBalance,
      dataDailySleep
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-Requested-With,content-type'
    );
    res.setHeader('Access-Control-Allow-Credentials', true);

    if (req.method == 'GET') {
      res.setHeader('Cache-control', `public, max-age=${cacheFor}`);
    } else {
      // for the other requests set strict no caching parameters
      res.setHeader('Cache-control', `no-store`);
    }

    res.end(JSON.stringify(data));
    res.end();
  })
  .listen(process.env.PORT || 3000);

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

/*

"contributors": {
        "activity_balance": 53,
        "body_temperature": 100,
        "hrv_balance": 88,
        "previous_day_activity": 86,
        "previous_night": 100,
        "recovery_index": 91,
        "resting_heart_rate": 100,
        "sleep_balance": 80
      },*/
