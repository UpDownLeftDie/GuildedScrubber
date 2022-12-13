import { TeamService } from '../../service';

export default async function handler(req, res) {
  const hmac = req.headers.hmac;
  if (req.method === `GET`) {
    const { teamId } = req.params;
    const channels = await TeamService.GetChannels(hmac, teamId);
    res.json(channels);
  } else {
    res.status(501);
  }
}
