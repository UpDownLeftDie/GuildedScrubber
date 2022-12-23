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
}

async function _getMessages({
  hmac,
  channelId,
  messageLimit,
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

  console.log({ initialLength: messages.length });

  for (const thread of threads) {
    console.log('threadId: ', thread.id);
    const { messages: threadMessages } = await _getMessages({
      hmac,
      channelId: thread.id,
      messageLimit,
      beforeDate,
      afterDate,
    });
    messages = messages.concat(threadMessages);
    console.log({
      threadLength: threadMessages.length,
      newLength: messages.length,
    });
  }

  return { messages, threads };
}
