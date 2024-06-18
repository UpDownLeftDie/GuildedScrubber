import { ChannelEndpoint } from "@/classes/Channel";
import { NextApiRequest } from "next";
import ChannelService from "../ChannelService";

export default class ForumService {
  static async GetThreads(req: NextApiRequest, channelId: string, page = 1, maxItems = 1000) {
    const res = await ChannelService.GetChannelEntity(req, channelId, ChannelEndpoint.FORUMS, {
      page,
      maxItems,
    });
    let { threads = [] } = res;

    console.log({ initialLength: threads.length });
    return { threads };
  }
}
