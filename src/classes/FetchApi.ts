import Cookies from "js-cookie";
import fetch from "node-fetch";

export default async function FetchApi({
  route,
  method = "GET",
  headers,
  data,
}: {
  route: string;
  method?: string;
  headers?: any;
  data?: any;
}) {
  const hmac = Cookies.get("guilded-hmac");
  const res = await fetch(`/api/${route}`, {
    method,
    headers: {
      ...headers,
      hmac,
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  if (res.ok) {
    try {
      return res.json();
    } catch (error) {
      return res.text();
    }
  }
}
