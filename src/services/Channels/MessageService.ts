import { ChannelEndpoint } from "@/classes/Channel";
import { GuildedMessage } from "@/classes/Message";
import { NextApiRequest } from "next";
import ChannelService from "../ChannelService";

export default class MessageService {
  static async GetMessages(
    req: NextApiRequest,
    channelId: string,
    {
      messageLimit = 100,
      beforeDate,
      afterDate,
    }: {
      messageLimit?: number;
      beforeDate?: string;
      afterDate?: string;
    },
  ) {
    const res = await ChannelService.GetChannelEntity(req, channelId, ChannelEndpoint.MESSAGES, {
      messageLimit,
      beforeDate,
      afterDate,
    });
    console.log({ res });

    const { threads = [] }: { threads: GuildedMessage[] } = res;
    let { messages = [] }: { messages: GuildedMessage[] } = res;

    for (const thread of threads) {
      const { messages: threadMessages } = await ChannelService.GetChannelEntity(
        req,
        thread.id,
        ChannelEndpoint.MESSAGES,
        {
          messageLimit,
          beforeDate,
          afterDate,
        },
      );
      messages = messages.concat(threadMessages);
    }

    return messages;
  }
}
