import { GuildedUser, GuildedUserTeam } from "@/classes/User";
import { NextApiRequest } from "next";
import ApiService from "./ApiService";

export default class UserService {
  static async GetUser(req: NextApiRequest) {
    const endpoint = `/me?isLogin=false&v2=true`;
    const res = await ApiService.FetchGuilded(req, endpoint);

    const { teams, user }: { user: GuildedUser; teams: GuildedUserTeam[] } = res;
    user.teams = teams;
    return user;
  }

  static async GetDMChannels(req: NextApiRequest, userId: string) {
    const endpoint = `/users/${userId}/channels`;
    const res = await ApiService.FetchGuilded(req, endpoint);
    const { channels } = res;

    return channels;
  }
}
