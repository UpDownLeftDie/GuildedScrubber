import UserService from '../../../service/UserService';

export default async function handler(req, res) {
  if (req.method === `GET`) {
    const { hmac } = req.headers;
    const { userId } = req.params;
    // Fetch DMs
    const dms = await UserService.GetDMChannels(hmac, userId);
    res.json(dms);
  } else {
    res.status(501);
  }
}
