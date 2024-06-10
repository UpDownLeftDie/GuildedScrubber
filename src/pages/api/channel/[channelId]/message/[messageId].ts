import { MessageService } from "@/services";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `PUT`) {
    const channelId = req.query.channelId as string;
    const messageId = req.query.messageId as string;
    const body = req.body as string;
    const updatedMessage = await MessageService.UpdateMessage(req, channelId, messageId, body);
    res.json(updatedMessage);
  } else if (req.method === `DELETE`) {
    const channelId = req.query.channelId as string;
    const messageId = req.query.messageId as string;

    const deletedMessage = await MessageService.DeleteMessage(req, channelId, messageId);
    res.json(deletedMessage);
  } else {
    res.status(501);
  }
}
