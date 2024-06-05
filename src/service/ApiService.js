import fetch from "make-fetch-happen";
import { v4 as uuid } from "uuid";

const API_URL = "https://www.guilded.gg/api";

export default class ApiService {
  static async FetchGuilded({ hmac, url, method = "GET", body }) {
    const fetchOptions = {
      method,
      body,
      headers: {
        authority: "www.guilded.gg",
        accept: "*/*",
        "cache-control": "no-cache",
        "content-type": "application/json",
        cookie: `authenticated=true; hmac_signed_session=${hmac};`,
        "guilded-client-id": uuid(),
        "guilded-viewer-platform": "desktop",
        pragma: "no-cache",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "none",
      },
      retry: {
        retries: 10,
        randomize: true,
      },
    };
    const apiUrl = `${API_URL}${url}`;

    console.log({ fetchOptions, apiUrl });
    return await fetch(apiUrl, fetchOptions)
      .then((res) => res.json())
      .then((json) => {
        console.log({ json });
        return json;
      })
      .catch((err) => console.error(err));
  }
}
