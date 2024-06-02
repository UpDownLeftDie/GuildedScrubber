import { v4 as uuid } from "uuid";
import fetch from "node-fetch";

const API_URL = "https://www.guilded.gg/api";

export default class ApiService {
  static async FetchGuilded({
    hmac,
    url,
    method = "GET",
    body,
  }: {
    hmac: string;
    url: string;
    method?: string;
    body?: string;
  }) {
    await delay(getRandomInt(200, 600));
    const res = await ApiService.RetryFetch({
      url: `${API_URL}${url}`,
      fetchOptions: {
        method,
        headers: {
          authority: "www.guilded.gg",
          accept: "application/json, text/javascript, */*; q=0.01",
          "cache-control": "no-cache",
          "content-type": "application/json",
          cookie: `hmac_signed_session=${hmac}; authenticated=true;`,
          "guilded-client-id": uuid(),
          pragma: "no-cache",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "none",
        },
        body,
      },
    }).catch((err) => console.error(err));
    return res?.json?.();
  }

  static async RetryFetch({
    url,
    fetchOptions = {},
    retries = 100,
    retryDelay = 5000,
    timeout,
  }: {
    url: string;
    fetchOptions?: any;
    retries?: number;
    retryDelay?: number;
    timeout?: number;
  }): Promise<fetch.Response> {
    return new Promise((resolve, reject) => {
      // check for timeout
      if (timeout) setTimeout(() => reject("error: timeout"), timeout);

      const wrapper = (n: number) => {
        fetch(url, fetchOptions)
          .then(async (res) => {
            if (res.status === 429) {
              if (n > 0) {
                await delay(getRandomInt(retryDelay - 1500, retryDelay + 1000));
                wrapper(--n);
              } else {
                reject(new Error(res.statusText));
              }
            } else {
              resolve(res);
            }
          })
          .catch(async (err) => {
            if (n > 0) {
              await delay(getRandomInt(retryDelay - 1500, retryDelay + 1000));
              wrapper(--n);
            } else {
              reject(err);
            }
          });
      };

      return wrapper(retries);
    });
  }
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
async function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}
