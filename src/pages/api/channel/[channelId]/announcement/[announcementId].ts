// https://www.guilded.gg/api/content/announcement/V6XpoZo6/replies

import { NextApiRequest, NextApiResponse } from 'next';
import ReplyService from '../../../../../service/ReplyService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === `GET`) {
    const { announcementId } = req.query;
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
