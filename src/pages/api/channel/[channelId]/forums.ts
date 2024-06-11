import { ForumService } from "@/services";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const channelId = req.query.channelId as string;
    const maxItems = Number(req.headers["max-items"] as string);
    const page = Number(req.headers.page as string);

    const messages = await ForumService.GetThreads(req, channelId, page, maxItems);
    res.json(messages);
  } else {
    res.status(501);
  }
}
