import { MessageService } from "@/services";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const channelId = req.query.channelId as string;

    const messageLimit = Number(req.headers["message-limit"] as string);
    const beforeDate = req.headers["before-date"] as string;
    const afterDate = req.headers["after-date"] as string;

    const messages = await MessageService.GetMessages(req, channelId, {
      messageLimit,
      beforeDate,
      afterDate,
    });
    res.json(messages);
  } else {
    res.status(501);
  }
}
