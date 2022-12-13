import { MessageService } from '../../service';

export default async function handler(req, res) {
  const hmac = req.headers.hmac;
  if (req.method === `PUT`) {
    const { messageId } = req.params;
    const { channelId, data } = req.body;
    // Fetch user
    const updatedMessage = await MessageService.UpdateMessage(
      hmac,
      channelId,
      messageId,
      data,
    );
    res.json(updatedMessage);
  } else if (req.method === `DELETE`) {
    const { messageId } = req.params;
    const { channelId } = req.body;
    // Fetch user
    const deletedMessage = await MessageService.DeleteMessage(
      hmac,
      channelId,
      messageId,
    );
    res.json(deletedMessage);
  } else {
    res.status(501);
  }
}
