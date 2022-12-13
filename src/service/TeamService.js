import ApiService from './ApiService';

export default class TeamService {
  async GetChannels(hmac, teamId) {
    const url = `/teams/${teamId}/channels`;
    const res = await ApiService.FetchGuilded(hmac, url);
    const { channels } = res;
    return channels;
  }
}
