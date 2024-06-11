export default async function FetchApi({
  route,
  method = "GET",
  headers,
  data,
}: {
  route: string;
  method?: string;
  headers?: HeadersInit;
  data?: any;
}) {
  const res = await fetch(`/api/${route}`, {
    method,
    headers,
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
