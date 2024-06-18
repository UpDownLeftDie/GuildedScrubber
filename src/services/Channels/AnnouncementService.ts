import { ChannelEndpoint } from "@/classes/Channel";
import { NextApiRequest } from "next";
import ChannelService from "../ChannelService";

export default class AnnouncementService {
  static async GetAnnouncements(
    req: NextApiRequest,
    channelId: string,
    {
      maxItems = 1000,
      beforeDate,
      afterDate,
    }: {
      maxItems?: number;
      beforeDate?: string;
      afterDate?: string;
    },
  ) {
    const { announcements = [] } = await ChannelService.GetChannelEntity(
      req,
      channelId,
      ChannelEndpoint.ANNOUNCEMENTS,
      {
        beforeDate,
        afterDate,
        maxItems,
      },
    );

    console.log({ announcements, totalLength: announcements.length });

    return announcements;
  }
}
