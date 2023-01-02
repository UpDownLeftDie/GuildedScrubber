// https://www.guilded.gg/api/content/announcement/V6XpoZo6/replies

import ReplyService from '../../../../service/ReplyService';

export default async function handler(req, res) {
  if (req.method === `GET`) {
    const { announcementId } = req.params;
    const { hmac } = req.headers;
    const replies = await ReplyService.GetAnnouncementsReplies({
      hmac,
      announcementId,
    });
    res.json(replies);
  } else {
    res.status(501);
  }
}
