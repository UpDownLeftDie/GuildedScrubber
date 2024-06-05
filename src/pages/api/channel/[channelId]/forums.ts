import Hmac from "@/classes/Hmac";
import { ForumService } from "@/service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const channelId = req.query.channelId as string;
    const hmac = Hmac.Sanitize(req.cookies["guilded-hmac"]);
    const maxItems = Number(req.headers["max-items"] as string);
    const page = Number(req.headers.page as string);

    const messages = await ForumService.GetThreads({
      hmac,
      channelId,
      maxItems,
      page,
    });
    res.json(messages);
  } else {
    res.status(501);
  }
}
