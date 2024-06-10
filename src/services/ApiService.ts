import fetch from "make-fetch-happen";
import { v4 as uuid } from "uuid";

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
    const headers: HeadersInit = {
      authority: "www.guilded.gg",
      accept: "*/*",
      "cache-control": "no-cache",
      "content-type": "application/json",
      cookie: `hmac_signed_session=${hmac}; authenticated=true;`,
      "guilded-client-id": uuid(),
      "guilded-viewer-platform": "desktop",
      pragma: "no-cache",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "none",
    };
    const fetchOptions = {
      method,
      ...(body && { body }),
      headers,
      retry: {
        retries: 10,
        randomize: true,
      },
    };
    const apiUrl = `${API_URL}${url}`;

    console.log({ apiUrl, fetchOptions });

    return await fetch(apiUrl, fetchOptions)
      .then((res) => res.json())
      .then((json) => {
        return json;
      })
      .catch((err) => console.error(err));
  }
}
