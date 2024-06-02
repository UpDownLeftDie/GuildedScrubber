import { NextApiRequest, NextApiResponse } from 'next';
import { ForumService } from '../../../../service';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === `GET`) {
    const { channelId } = req.query;
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
