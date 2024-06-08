import Hmac from "@/classes/Hmac";
import { ChannelService } from "@/services";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const channelId = req.query.channelId as string;

    const hmac = Hmac.Sanitize(req.cookies["guilded-hmac"]);
    const messageLimit = Number(req.headers["message-limit"] as string);
    const beforeDate = req.headers["before-date"] as string;
    const afterDate = req.headers["after-date"] as string;

    const messages = await ChannelService.GetMessages({
      hmac,
      channelId,
      messageLimit,
      beforeDate,
      afterDate,
    });
    res.json(messages);
  } else {
    res.status(501);
  }
}
