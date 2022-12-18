import ApiService from './ApiService';

export default class ChannelService {
  static async GetMessages({
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
    const messages = res.messages;
    return messages || [];
  }
}
