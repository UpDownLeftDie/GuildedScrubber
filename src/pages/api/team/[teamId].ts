import Hmac from "@/classes/Hmac";
import { TeamService } from "@/services";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hmac = Hmac.Sanitize(req.cookies["guilded-hmac"]);
  if (req.method === `GET`) {
    const teamId = req.query?.teamId as string;
    const [channels, groups] = await Promise.all([
      TeamService.GetChannels(hmac, teamId),
      TeamService.GetGroups(hmac, teamId),
    ]);
    res.json({ channels, ...groups });
  } else {
    res.status(501);
  }
}
