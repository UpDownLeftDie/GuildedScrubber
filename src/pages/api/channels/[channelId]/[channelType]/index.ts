// Root channel controller
//  ex: /channels/{channelId}/messages
// See ./[entityId]/index.ts for messages controller
//  ex: /channels/{channelId}/messages/{messageId}

import { ChannelEndpoint } from "@/classes/Channel";
import { AvailabilityService, ForumService, MessageService } from "@/services";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    const channelId = req.query.channelId as string;
    const channelType = req.query.channelType as ChannelEndpoint;

    if (!channelId || !channelType) {
      return res.status(400).json({ message: "Missing either channelId or channelType" });
    }

    const messageLimit = Number(req.headers["message-limit"] as string);
    const maxItems = Number(req.headers["max-items"] as string);
    const beforeDate = req.headers["before-date"] as string;
    const afterDate = req.headers["after-date"] as string;

    let entities;
    switch (channelType) {
      case ChannelEndpoint.AVAILABILITY:
        entities = await AvailabilityService.GetAvailabilities(req, channelId, {
          beforeDate,
          afterDate,
        });
        break;
      case ChannelEndpoint.FORUMS:
        const page = Number(req.headers.page as string);
        entities = await ForumService.GetThreads(req, channelId, page, maxItems);
        break;
      case ChannelEndpoint.MESSAGES:
        entities = await MessageService.GetMessages(req, channelId, {
          messageLimit,
          beforeDate,
          afterDate,
        });
        break;
      case ChannelEndpoint.ANNOUNCEMENTS:
      case ChannelEndpoint.LIST_ITEMS:
        return res.status(501).json({ message: "This channel type isn't setup yet" });
      default:
        return res.status(404).json({ message: "Unknown channelType" });
    }

    return res.json(entities);
  } else {
    return res.status(404);
  }
}
