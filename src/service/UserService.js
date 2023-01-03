import ApiService from './ApiService';

export default class UserService {
  static async GetUser(hmac) {
    const url = `/me?isLogin=true&v2=true`;
    const res = await ApiService.FetchGuilded({ hmac, url });
    const { teams, user } = res;
    user.teams = teams;
    return user;
  }

  static async GetDMChannels(hmac, userId) {
    const url = `/users/${userId}/channels`;
    const res = await ApiService.FetchGuilded({ hmac, url });
    const { channels } = res;

    return channels;
  }
}
