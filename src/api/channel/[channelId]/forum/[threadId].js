//www.guilded.gg/api/channels/34f5eafd-df6e-4dfb-aaf5-3b374756692f/forums/2135097513/replies?&maxItems=1000

import { ChannelService } from '../../../service';
export default async function handler(req, res) {
  if (req.method === `GET`) {
    const { channelId, threadId } = req.params;
    const { hmac, 'max-items': maxItems } = req.headers;
    const replies = await ChannelService.GetReplies({
      hmac,
      channelId,
      threadId,
      maxItems,
    });
    res.json(replies);
  } else {
    res.status(501);
  }
}
