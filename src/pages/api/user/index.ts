import { UserService } from "@/services";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const user = await UserService.GetUser(req);
    res.json(user);
  } else {
    res.status(501);
  }
}
