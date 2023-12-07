const { log } = require('console');
var http = require('http');
const { type } = require('os');
const { getOuraData } = require('./src/oura.js');
const { getRaindropData } = require('./src/raindrop.js');

const ouraAccessToken = process.env.OURA_ACCESS_TOKEN;
const raindropAccessToken = process.env.RAINDROP_ACCESS_TOKEN;

const cacheFor = 60 * 60 * 1; // 1 hours

http
  .createServer(async function (req, res) {
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

    if (req.url === '/oura') {
      const data = await getOuraData(ouraAccessToken);
      res.end(JSON.stringify(data));
    } else if (req.url === '/raindrop') {
      const data = await getRaindropData(raindropAccessToken);
      res.end(JSON.stringify(data));
    } else {
      res.end();
    }
  })
  .listen(process.env.PORT || 3000);
