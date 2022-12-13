export default async function handler(req, res) {
  if (req.method === `GET`) {
    const hmac = req.headers.hmac;
    // Fetch user

    res.json(user);
  } else {
    res.status(501);
  }
}
