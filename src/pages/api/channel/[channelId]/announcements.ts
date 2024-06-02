import { NextApiRequest, NextApiResponse } from 'next';
import { ChannelService } from '../../../../service';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === `GET`) {
    const { channelId } = req.query;
    const {
      hmac,
      maxItems: maxItems,
      'before-date': beforeDate,
      'after-date': afterDate,
    } = req.headers;
    const announcements = await ChannelService.GetAnnouncements({
      hmac,
      channelId,
      maxItems,
      beforeDate,
      afterDate,
    });
    res.json(announcements);
  } else {
    res.status(501);
  }
}
