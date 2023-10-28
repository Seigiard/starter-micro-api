const { log } = require('console');
var http = require('http');
const Client = require("oura-cloud-api");

const accessToken = 'I5UAHQTSTW76DXV2R3GCDZBDNKXC6CQ6';

http.createServer(async function (req, res) {
    const client = new Client(accessToken);

    const data = await client.getDailyReadiness({ start_date: "2023-10-25", end_date: "2023-10-28" });

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);;
    res.end(JSON.stringify(data));
    res.end();
}).listen(process.env.PORT || 3000);