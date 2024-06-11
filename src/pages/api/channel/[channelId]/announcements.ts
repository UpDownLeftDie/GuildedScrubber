import AnnouncementService from "@/services/AnnouncementService";
import { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const channelId = req.query.channelId as string;
    const maxItems = Number(req.headers.maxItems as string);
    const beforeDate = req.headers["before-date"] as string;
    const afterDate = req.headers["after-date"] as string;

    const announcements = await AnnouncementService.GetAnnouncements(req, channelId, {
      maxItems,
      beforeDate,
      afterDate,
    });
    res.json(announcements);
  } else {
    res.status(501);
  }
}
