import Hmac from "@/classes/Hmac";
import { MessageService } from "@/service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hmac = Hmac.Sanitize(req.headers.hmac);
  if (req.method === `PUT`) {
    const channelId = req.query.channelId as string;
    const messageId = req.query.messageId as string;
    const body = req.body as string;
    const updatedMessage = await MessageService.UpdateMessage(hmac, channelId, messageId, body);
    res.json(updatedMessage);
  } else if (req.method === `DELETE`) {
    const channelId = req.query.channelId as string;
    const messageId = req.query.messageId as string;

    const deletedMessage = await MessageService.DeleteMessage(hmac, channelId, messageId);
    res.json(deletedMessage);
  } else {
    res.status(501);
  }
}
