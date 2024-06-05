import Cookies from "js-cookie";

export default async function FetchApi({
  route,
  method = "GET",
  headers,
  data,
}) {
  const hmac = Cookies.get("guilded-hmac").trim();
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
