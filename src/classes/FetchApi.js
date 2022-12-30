import Cookies from 'js-cookie';
import fetch from 'node-fetch';

export default function FetchApi({ route, method = 'GET', headers, data }) {
  const hmac = Cookies.get('guilded-hmac');
  return fetch(`/api/${route}`, {
    method,
    headers: {
      ...headers,
      hmac,
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  }).then((res) => {
    if (res.ok) {
      try {
        return res.json();
      } catch (error) {
        return res.text();
      }
    }
  });
}
