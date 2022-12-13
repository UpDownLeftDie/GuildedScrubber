import ApiService from './ApiService';

export default class MessageService {
  async GetMessages(hmac, channelId, beforeDate, messageLimit) {
    const url = new URL(`/channels/${channelId}/messages`);
    url.searchParams.append('limit', messageLimit);
    if (beforeDate) url.searchParams.append('beforeDate', beforeDate);
    const res = await ApiService.FetchGuilded(hmac, url.href);
    const messages = res.messages;
    console.log('getMessages', { messages });
    return messages;
  }

  async UpdateMessage(hmac, channelId, messageId, data) {
    const url = new URL(`/channels/${channelId}/messages/${messageId}`);
    return ApiService.FetchGuilded(hmac, url, 'PUT', data);
  }

  async DeleteMessage(hmac, channelId, messageId) {
    const url = new URL(`/channels/${channelId}/messages/${messageId}`);
    return ApiService.FetchGuilded(hmac, url, 'DELETE');
  }
}
