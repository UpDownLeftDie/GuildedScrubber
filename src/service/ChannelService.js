import ApiService from './ApiService';

export default class ChannelService {
  static async GetMessages({
    hmac,
    channelId,
    messageLimit,
    beforeDate,
    afterDate,
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
}

async function _getMessages({
  hmac,
  channelId,
  messageLimit = 100,
  beforeDate,
  afterDate,
}) {
  let params = new URLSearchParams();
  params.append('limit', messageLimit);
  if (beforeDate) params.append('beforeDate', beforeDate);
  if (afterDate) params.append('afterDate', afterDate);
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
}) {
  let params = new URLSearchParams();
  params.append('maxItems', maxItems);
  if (beforeDate) params.append('beforeDate', beforeDate);
  if (afterDate) params.append('afterDate', afterDate);
  const url = `/channels/${channelId}/announcements?${params.toString()}`;

  const { announcements = [] } = await ApiService.FetchGuilded({ hmac, url });

  return { announcements };
}
