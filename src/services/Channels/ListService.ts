import { ChannelEndpoint } from "@/classes/Channel";
import { NextApiRequest } from "next";
import ChannelService from "../ChannelService";

export default class ListService {
  static async GetListItems(
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
    const listItems =
      (await ChannelService.GetChannelEntity(req, channelId, ChannelEndpoint.LIST_ITEMS, {
        beforeDate,
        afterDate,
      })) ?? [];
    console.log({ listItems, totalLength: listItems.length });

    return listItems;
  }
}
