import { ForumService } from '../../../service';
export default async function handler(req, res) {
  if (req.method === `GET`) {
    const { channelId } = req.params;
    const { hmac, 'max-items': maxItems, page: page } = req.headers;
    const messages = await ForumService.GetThreads({
      hmac,
      channelId,
      maxItems,
      page,
    });
    res.json(messages);
  } else {
    res.status(501);
  }
}
