import AvailabilityService from "@/services/AvailabilityService";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const channelId = req.query.channelId as string;
    const beforeDate = req.headers["before-date"] as string;
    const afterDate = req.headers["after-date"] as string;

    const messages = await AvailabilityService.GetAvailabilities(req, channelId, {
      beforeDate,
      afterDate,
    });
    res.json(messages);
  } else {
    res.status(501);
  }
}
