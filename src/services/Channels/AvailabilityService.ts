import { ChannelEndpoint } from "@/classes/Channel";
import { NextApiRequest } from "next";
import ChannelService from "../ChannelService";

export default class AvailabilityService {
  static async GetAvailabilities(
    req: NextApiRequest,
    channelId: string,
    {
      beforeDate,
      afterDate,
    }: {
      beforeDate?: string;
      afterDate?: string;
    },
  ) {
    const availabilities =
      (await ChannelService.GetChannelEntity(req, channelId, ChannelEndpoint.AVAILABILITY, {
        beforeDate,
        afterDate,
      })) ?? [];
    return availabilities;
  }
}
