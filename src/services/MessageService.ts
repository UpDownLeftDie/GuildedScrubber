import { GuildedMessage } from "@/classes/Message";
import HTTPMethod from "http-method-enum";
import { NextApiRequest } from "next";
import ApiService from "./ApiService";
import ChannelService, { EntityType } from "./ChannelService";

export default class MessageService {
  static async UpdateMessage(
    req: NextApiRequest,
    channelId: string,
    messageId: string,
    body: string,
  ) {
    const endpoint = `/channels/${channelId}/messages/${messageId}`;
    return await ApiService.FetchGuilded(req, endpoint, HTTPMethod.PUT, body);
  }

  static async DeleteMessage(req: NextApiRequest, channelId: string, messageId: string) {
    return await ChannelService.DeleteChannelEntity(req, channelId, EntityType.MESSAGES, messageId);
  }

  static async GetMessages(
    req: NextApiRequest,
    channelId: string,
    {
      messageLimit,
      beforeDate,
      afterDate,
    }: {
      messageLimit?: number;
      beforeDate?: string;
      afterDate?: string;
    },
  ) {
    const { messages } = await _getMessages(req, channelId, {
      messageLimit,
      beforeDate,
      afterDate,
    });
    console.log({ messages, totalLength: messages.length });

    return messages;
  }
}

async function _getMessages(
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
  let params = new URLSearchParams();
  params.append("limit", messageLimit.toString());
  if (beforeDate) params.append("beforeDate", beforeDate);
  if (afterDate) params.append("afterDate", afterDate);
  const endpoint = `/channels/${channelId}/messages?${params.toString()}`;
  const res = await ApiService.FetchGuilded(req, endpoint);
  const { threads = [] }: { threads: GuildedMessage[] } = res;
  let { messages = [] }: { messages: GuildedMessage[] } = res;

  for (const thread of threads) {
    const { messages: threadMessages } = await _getMessages(req, thread.id, {
      messageLimit,
      beforeDate,
      afterDate,
    });
    messages = messages.concat(threadMessages);
  }

  return { messages, threads };
}
