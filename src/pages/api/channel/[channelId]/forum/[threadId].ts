//www.guilded.gg/api/channels/34f5eafd-df6e-4dfb-aaf5-3b374756692f/forums/2135097513/replies?&maxItems=1000

import Hmac from "@/classes/Hmac";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const channelId = req.query.channelId as string;
    const threadId = req.query.threadId as string;

    const hmac = Hmac.Sanitize(req.cookies["guilded-hmac"]);
    const maxItems = Number(req.headers["max-items"] as string);
    res.status(501);
    // const replies = await ChannelService.GetReplies({
    //   hmac,
    //   channelId,
    //   threadId,
    //   maxItems,
    // });
    // res.json(replies);
  } else {
    res.status(501);
  }
}
