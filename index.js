const { log } = require('console');
var http = require('http');
const Client = require('oura-cloud-api');

const accessToken = 'I5UAHQTSTW76DXV2R3GCDZBDNKXC6CQ6';

const cacheFor = 60 * 60 * 1; // 1 hours

http
  .createServer(async function (req, res) {
    const client = new Client(accessToken);

    const data = await client.getDailyReadiness({
      start_date: getWeekAgoDate(),
      end_date: getTodayDate(),
    });

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
