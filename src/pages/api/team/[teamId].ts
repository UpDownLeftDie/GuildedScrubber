import { NextApiRequest, NextApiResponse } from 'next';
import { TeamService } from '../../../service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const hmac = req.headers.hmac as string;
  if (req.method === `GET`) {
    const teamId = req.query?.teamId as string;
    const channels = await TeamService.GetChannels(hmac, teamId);
    res.json(channels);
  } else {
    res.status(501);
  }
}
