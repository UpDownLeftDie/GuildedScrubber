import Hmac from "@/classes/Hmac";
import { TeamService } from "@/service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hmac = Hmac.Sanitize(req.cookies["guilded-hmac"]);
  if (req.method === `GET`) {
    const teamId = req.query?.teamId as string;
    const channels = await TeamService.GetChannels(hmac, teamId);
    res.json(channels);
  } else {
    res.status(501);
  }
}
