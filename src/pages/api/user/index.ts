import Hmac from "@/classes/Hmac";
import { UserService } from "@/service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const hmac = Hmac.Sanitize(req.headers.hmac);
    // Fetch user
    const user = await UserService.GetUser(hmac);
    res.json(user);
  } else {
    res.status(501);
  }
}
