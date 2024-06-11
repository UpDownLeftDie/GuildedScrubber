import { ChannelService } from "@/services";
import { EntityType } from "@/services/ChannelService";
import { NextApiRequest, NextApiResponse } from "next";

const entityType = EntityType.AVAILABILITY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `DELETE`) {
    const channelId = req.query.channelId as string;
    const entityId = req.query.availabilityId as string;

    const deletedMessage = await ChannelService.DeleteChannelEntity(
      req,
      channelId,
      entityType,
      entityId,
    );
    res.json(deletedMessage);
  } else {
    res.status(501);
  }
}
