import ApiService from './ApiService';

export default class UserService {
  static async GetUser(hmac) {
    const url = `/me?isLogin=true&v2=true`;
    const res = await ApiService.FetchGuilded({ hmac, url });
    const { teams, user } = res;
    this.userId = user.id;
    user.teams = teams;
    return user;
  }

  static async GetDMChannels(hmac) {
    let teamChannels = JSON.parse(localStorage.getItem('teamChannels') || '{}');

    const url = `/users/${this.userId}/channels`;
    const res = await ApiService.FetchGuilded({ hmac, url });
    const { channels } = res;

    teamChannels.dm = channels;
    localStorage.setItem('teamChannels', JSON.stringify(teamChannels));
    return channels;
  }
}
