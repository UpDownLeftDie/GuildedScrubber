import Hmac from "@/classes/Hmac";
import { NextApiRequest, NextApiResponse } from "next";
import { ChannelService } from "../../../../service";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const channelId = req.query.channelId as string;
    const hmac = Hmac.Sanitize(req.headers.hmac);
    const maxItems = Number(req.headers.maxItems as string);
    const beforeDate = req.headers["before-date"] as string;
    const afterDate = req.headers["after-date"] as string;

    const announcements = await ChannelService.GetAnnouncements({
      hmac,
      channelId,
      maxItems,
      beforeDate,
      afterDate,
    });
    res.json(announcements);
  } else {
    res.status(501);
  }
}