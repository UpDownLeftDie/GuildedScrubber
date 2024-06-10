import HTTPMethod from "http-method-enum";
import fetch from "make-fetch-happen";
import { NextApiRequest } from "next";
import { v4 as uuid } from "uuid";

const API_URL = "https://www.guilded.gg/api";

export default class ApiService {
  static async FetchGuilded(
    req: NextApiRequest,
    endpoint: string,
    method = HTTPMethod.GET,
    body?: string,
  ) {
    const hmac = req.cookies["guilded-hmac"];
    if (!hmac) {
      return Response.json({ status: 401 });
    }
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
    const fetchOptions: fetch.FetchOptions = {
      method,
      ...(body && { body }),
      headers,
      retry: {
        retries: 10,
        randomize: true,
      },
    };
    const externalApiUrl = `${API_URL}${endpoint}`;

    console.debug({ externalApiUrl, fetchOptions });

    return await fetch(externalApiUrl, fetchOptions)
      .then((res) => res.json())
      .then((json) => {
        return json;
      })
      .catch((err) => console.error(err));
  }
}
