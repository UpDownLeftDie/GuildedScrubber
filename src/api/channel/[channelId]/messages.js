import { ChannelService } from '../../../service';
export default async function handler(req, res) {
  if (req.method === `GET`) {
    const { channelId } = req.params;
    const {
      hmac,
      'message-limit': messageLimit,
      'before-date': beforeDate,
      'after-date': afterDate,
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
