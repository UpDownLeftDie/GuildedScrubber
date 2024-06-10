import { UserService } from "@/services";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const userId = req.query.userId as string;
    // Fetch DMs
    const dms = await UserService.GetDMChannels(req, userId);
    res.json(dms);
  } else {
    res.status(501);
  }
}
