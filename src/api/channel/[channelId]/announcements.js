import { ChannelService } from '../../../service';
export default async function handler(req, res) {
  if (req.method === `GET`) {
    const { channelId } = req.params;
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
