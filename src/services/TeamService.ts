import { GuildedTeamChannels, GuildedTeamGroup } from "@/classes/Team";
import { NextApiRequest } from "next";
import ApiService from "./ApiService";

export default class TeamService {
  static async GetChannels(req: NextApiRequest, teamId: string) {
    const endpoint = `/teams/${teamId}/channels`;
    const channels: GuildedTeamChannels = await ApiService.FetchGuilded(req, endpoint);
    return channels;
  }

  static async GetGroups(req: NextApiRequest, teamId: string) {
    const endpoint = `/teams/${teamId}/groups`;
    const groups: GuildedTeamGroup[] = await ApiService.FetchGuilded(req, endpoint);
    return groups ?? [];
  }
}
