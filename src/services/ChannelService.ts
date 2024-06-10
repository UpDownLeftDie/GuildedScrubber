import ApiService from "./ApiService";

export enum EntityType {
  AVAILABILITY = "availability",
}

export default class ChannelService {
  static async DeleteChannelEntity({
    hmac,
    channelId,
    entityType,
    entityId,
  }: {
    hmac: string;
    channelId: string;
    entityType: EntityType;
    entityId: string;
  }) {
    const url = `/channels/${channelId}/${entityType}/${entityId}`;
    return await ApiService.FetchGuilded({ hmac, url, method: "DELETE" });
  }

  static async GetMessages({
    hmac,
    channelId,
    messageLimit,
    beforeDate,
    afterDate,
  }: {
    hmac: string;
    channelId: string;
    messageLimit?: number;
    beforeDate?: string;
    afterDate?: string;
  }) {
    const { messages } = await _getMessages({
      hmac,
      channelId,
      messageLimit,
      beforeDate,
      afterDate,
    });
    console.log({ messages, totalLength: messages.length });

    return messages;
  }

  static async GetAnnouncements({
    hmac,
    channelId,
    maxItems,
    beforeDate,
    afterDate,
  }: {
    hmac: string;
    channelId: string;
    maxItems?: number;
    beforeDate?: string;
    afterDate?: string;
  }) {
    const { announcements } = await _getAnnouncements({
      hmac,
      channelId,
      maxItems,
      beforeDate,
      afterDate,
    });
    console.log({ announcements, totalLength: announcements.length });

    return announcements;
  }

  static async GetAvailabilities({
    hmac,
    channelId,
    beforeDate,
    afterDate,
  }: {
    hmac: string;
    channelId: string;
    beforeDate?: string;
    afterDate?: string;
  }) {
    const { availabilities } = await _getAvailabilities({
      hmac,
      channelId,
      beforeDate,
      afterDate,
    });
    console.log({ availabilities, totalLength: availabilities.length });

    return availabilities;
  }
}

async function _getMessages({
  hmac,
  channelId,
  messageLimit = 100,
  beforeDate,
  afterDate,
}: {
  hmac: string;
  channelId: string;
  messageLimit?: number;
  beforeDate?: string;
  afterDate?: string;
}) {
  let params = new URLSearchParams();
  params.append("limit", messageLimit.toString());
  if (beforeDate) params.append("beforeDate", beforeDate);
  if (afterDate) params.append("afterDate", afterDate);
  const url = `/channels/${channelId}/messages?${params.toString()}`;
  const res = await ApiService.FetchGuilded({ hmac, url });
  const { threads = [] } = res;
  let { messages = [] } = res;

  for (const thread of threads) {
    const { messages: threadMessages } = await _getMessages({
      hmac,
      channelId: thread.id,
      messageLimit,
      beforeDate,
      afterDate,
    });
    messages = messages.concat(threadMessages);
  }

  return { messages, threads };
}

async function _getAnnouncements({
  hmac,
  channelId,
  maxItems = 1000,
  beforeDate,
  afterDate,
}: {
  hmac: string;
  channelId: string;
  maxItems?: number;
  beforeDate?: string;
  afterDate?: string;
}) {
  let params = new URLSearchParams();
  params.append("maxItems", maxItems.toString());
  if (beforeDate) params.append("beforeDate", beforeDate);
  if (afterDate) params.append("afterDate", afterDate);
  const url = `/channels/${channelId}/announcements?${params.toString()}`;

  const { announcements = [] } = await ApiService.FetchGuilded({ hmac, url });

  return { announcements };
}

async function _getAvailabilities({
  hmac,
  channelId,
  beforeDate,
  afterDate,
}: {
  hmac: string;
  channelId: string;
  beforeDate?: string;
  afterDate?: string;
}) {
  let params = new URLSearchParams();
  if (beforeDate) params.append("beforeDate", beforeDate);
  if (afterDate) params.append("afterDate", afterDate);
  const url = `/channels/${channelId}/availability?${params.toString()}`;

  const availabilities = (await ApiService.FetchGuilded({ hmac, url })) ?? [];

  return { availabilities };
}
