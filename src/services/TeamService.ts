import { GuildedTeamChannels, GuildedTeamGroup } from "@/classes/Team";
import ApiService from "./ApiService";

export default class TeamService {
  static async GetChannels(hmac: string, teamId: string) {
    const url = `/teams/${teamId}/channels`;
    const channels: GuildedTeamChannels = await ApiService.FetchGuilded({ hmac, url });
    return channels;
  }

  static async GetGroups(hmac: string, teamId: string) {
    const url = `/teams/${teamId}/groups`;
    const groups: GuildedTeamGroup[] = await ApiService.FetchGuilded({ hmac, url });
    return groups ?? [];
  }
}
