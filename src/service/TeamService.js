import ApiService from './ApiService';

export default class TeamService {
  static async GetChannels(hmac, teamId) {
    const url = `/teams/${teamId}/channels`;
    const channels = await ApiService.FetchGuilded({ hmac, url });
    return channels;
  }
}
