import ApiService from "./ApiService";

export default class MessageService {
  static async UpdateMessage(hmac: string, channelId: string, messageId: string, body: string) {
    const url = `/channels/${channelId}/messages/${messageId}`;
    return await ApiService.FetchGuilded({ hmac, url, method: "PUT", body });
  }

  static async DeleteMessage(hmac: string, channelId: string, messageId: string) {
    const url = `/channels/${channelId}/messages/${messageId}`;
    return await ApiService.FetchGuilded({ hmac, url, method: "DELETE" });
  }
}
