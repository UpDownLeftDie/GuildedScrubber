import { MessageService } from '../../../../service';

export default async function handler(req, res) {
  const hmac = req.headers.hmac;
  if (req.method === `PUT`) {
    const { messageId, channelId } = req.params;
    const { body } = req;
    // Fetch user
    console.log('dfjkhasdkfjahdskfjhasf', { body });
    const updatedMessage = await MessageService.UpdateMessage(
      hmac,
      channelId,
      messageId,
      body,
    );
    res.json(updatedMessage);
  } else if (req.method === `DELETE`) {
    const { messageId, channelId } = req.params;
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
