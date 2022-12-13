import { v4 as uuid } from 'uuid';
import fetch from 'node-fetch';

const API_URL = 'https://www.guilded.gg/api';

export default class ApiService {
  static async FetchGuilded(hmac, url, method = 'GET', data) {
    const res = await retryFetch(
      `${API_URL}${url}`,
      {
        method,
        headers: {
          authority: 'www.guilded.gg',
          accept: 'application/json, text/javascript, */*; q=0.01',
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          cookie: `hmac_signed_session=${hmac}; authenticated=true;`,
          'guilded-client-id': uuid(),
          pragma: 'no-cache',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'none',
        },
        ...(data ? { body: JSON.stringify(data) } : {}),
      },
      10,
    ).catch((err) => console.error(err));
    return res.json();
  }
}

async function delay(ms) {
  new Promise((resolve) => setTimeout(() => resolve(), ms));
}
async function retryFetch(
  url,
  fetchOptions = {},
  retries = 5,
  retryDelay = 5000,
  timeout = 60000,
) {
  return new Promise((resolve, reject) => {
    // check for timeout
    if (timeout) setTimeout(() => reject('error: timeout'), timeout);

    const wrapper = (n) => {
      fetch(url, fetchOptions)
        .then(async (res) => {
          if (res.status === 429) {
            await delay(retryDelay);
            wrapper(--n);
          }

          resolve(res);
        })
        .catch(async (err) => {
          if (n > 0) {
            await delay(retryDelay);
            wrapper(--n);
          } else {
            reject(err);
          }
        });
    };

    wrapper(retries);
  });
}