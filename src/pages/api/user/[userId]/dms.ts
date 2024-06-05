import Hmac from "@/classes/Hmac";
import { UserService } from "@/service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const hmac = Hmac.Sanitize(req.cookies["guilded-hmac"]);
    const userId = req.query.userId as string;
    // Fetch DMs
    const dms = await UserService.GetDMChannels(hmac, userId);
    res.json(dms);
  } else {
    res.status(501);
  }
}
