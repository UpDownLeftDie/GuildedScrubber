import ApiService from "./ApiService";

export default class MessageService {
  static async UpdateMessage(hmac, channelId, messageId, body) {
    const url = `/channels/${channelId}/messages/${messageId}`;
    return await ApiService.FetchGuilded({ hmac, url, method: "PUT", body });
  }

  static async DeleteMessage(hmac, channelId, messageId) {
    const url = `/channels/${channelId}/messages/${messageId}`;
    return await ApiService.FetchGuilded({ hmac, url, method: "DELETE" });
  }
}
