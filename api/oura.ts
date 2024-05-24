import type { VercelRequest, VercelResponse } from '@vercel/node';

const baseUrl = "https://api.ouraring.com/v2/usercollection/";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const accessToken = req.headers.authorization?.replace("Bearer ", "");
  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }
  const response = await getOuraData(accessToken);
  return res.json(response)
}

async function getOuraData(accessToken: string) {
  const client = new OuraClient(accessToken);

  const start_date = getWeekAgoDate();
  const end_date = getTodayDate();

  const [dailyReadinessRawData, dailySleepRawData] = await Promise.all([
    client.getDailyReadiness({
      start_date,
      end_date,
    }),
    client.getDailySleep({
      start_date,
      end_date,
    })
  ]);

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

type FnType = (...args: any[]) => any;
function getScoreByData(data, key, field: string | FnType = 'score') {
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

export class OuraClient {
  accessToken: string;
  baseUrl = "https://api.ouraring.com/v2/usercollection/";

  constructor(accessToken: string) {
    if (!accessToken) {
      throw "Missing access token";
    }
    this.accessToken = accessToken;
  }

  runRequest = async (url: string, qs) => {
    const params = new URLSearchParams(qs);

    const response = await fetch(this.baseUrl + encodeURI(url) + (qs ? "?" + params.toString() : ""), {
      method: "GET",
      headers: {
        "Host": "api.ouraring.com",
        "Authorization": "Bearer " + this.accessToken
      }
    });

    const parsed = await response.json();
    if (response.status >= 200 && response.status < 300) {
      return parsed;
    } else {
      throw `${response.status} ${response.statusText}${parsed?.detail ? " - " + JSON.stringify(parsed.detail) : ""} `;
    }
  };

  async getDailyReadiness(qs) {
    validateQS(qs, ["start_date", "end_date", "next_token"]);
    return await this.runRequest("daily_readiness", qs);
  }

  async getDailySleep(qs) {
    validateQS(qs, ["start_date", "end_date", "next_token"]);
    return await this.runRequest("daily_sleep", qs);
  }
}

const validateQS = (qs: Record<string, string>, allowedKeys: string[]) => {
  for (const key in qs) {
    if (Object.prototype.hasOwnProperty.call(qs, key)) {
      if (allowedKeys.includes(key) === false) {
        throw `Invalid parameter '${key}'.`;
      }
    }
  }
  return true;
};