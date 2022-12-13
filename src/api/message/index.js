import { MessageService } from '../../service';

export default async function handler(req, res) {
  if (req.method === `GET`) {
    const hmac = req.headers.hmac;
    // Fetch user
    const user = await UserService.GetUser(hmac);
    res.json(user);
  } else {
    res.status(501);
  }
}
