import { GuildedUser, GuildedUserTeam } from "@/classes/User";
import ApiService from "./ApiService";

export default class UserService {
  static async GetUser(hmac: string) {
    const url = `/me?isLogin=false&v2=true`;
    const res = await ApiService.FetchGuilded({ hmac, url });

    const { teams, user }: { user: GuildedUser; teams: GuildedUserTeam[] } = res;
    user.teams = teams;
    return user;
  }

  static async GetDMChannels(hmac: string, userId: string) {
    const url = `/users/${userId}/channels`;
    const res = await ApiService.FetchGuilded({ hmac, url });
    const { channels } = res;

    return channels;
  }
}
