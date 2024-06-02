import { NextApiRequest, NextApiResponse } from "next";
import UserService from "../../../../service/UserService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const { hmac } = req.headers;
    const { userId } = req.query;
    // Fetch DMs
    const dms = await UserService.GetDMChannels(hmac, userId);
    res.json(dms);
  } else {
    res.status(501);
  }
}
