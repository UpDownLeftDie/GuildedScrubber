import { NextApiRequest, NextApiResponse } from "next";
import { MessageService } from "../../../../../service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hmac = req.headers.hmac;
  if (req.method === `PUT`) {
    const { messageId, channelId } = req.query;
    const { body } = req;

    const updatedMessage = await MessageService.UpdateMessage(hmac, channelId, messageId, body);
    res.json(updatedMessage);
  } else if (req.method === `DELETE`) {
    const { messageId, channelId } = req.query;

    const deletedMessage = await MessageService.DeleteMessage(hmac, channelId, messageId);
    res.json(deletedMessage);
  } else {
    res.status(501);
  }
}
