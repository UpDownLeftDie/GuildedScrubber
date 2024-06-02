import { NextApiRequest, NextApiResponse } from "next";
import { ChannelService } from "../../../../service";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const { channelId } = req.query;
    const {
      hmac,
      "message-limit": messageLimit,
      "before-date": beforeDate,
      "after-date": afterDate,
    } = req.headers;
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
