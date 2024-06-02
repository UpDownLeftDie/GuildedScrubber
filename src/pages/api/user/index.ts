import { NextApiRequest, NextApiResponse } from "next";
import UserService from "../../../service/UserService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const hmac = req.headers.hmac;
    // Fetch user
    const user = await UserService.GetUser(hmac);
    res.json(user);
  } else {
    res.status(501);
  }
}
