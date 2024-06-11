import { TeamService } from "@/services";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const teamId = req.query?.teamId as string;
    const [channels, groups] = await Promise.all([
      TeamService.GetChannels(req, teamId),
      TeamService.GetGroups(req, teamId),
    ]);
    res.json({ channels, ...groups });
  } else {
    res.status(501);
  }
}
