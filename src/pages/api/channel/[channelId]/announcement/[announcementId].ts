// https://www.guilded.gg/api/content/announcement/V6XpoZo6/replies

import Hmac from "@/classes/Hmac";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const announcementId = req.query.announcementId as string;
    const hmac = Hmac.Sanitize(req.headers.hmac);
    res.status(501);
    // const replies = await ReplyService.GetAnnouncementsReplies({
    //   hmac,
    //   announcementId,
    // });
    // res.json(replies);
  } else {
    res.status(501);
  }
}
