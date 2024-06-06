import { GuildedChannel, GuildedDMChannel, GuildedTeamChannel } from "./Channel";
import FetchApi from "./FetchApi";

export default class Team {
  isTeam = true;
  id: string;
  channels!: GuildedChannel[];
  categories!: GuildedTeamCategory[];
  name: string = "";
  ownerId: string = "";
  isAdmin: boolean = false;
  subdomain: string = "";
  profilePicture: string = "";
  teamDashImage: string = "";

  constructor(id: string, storedTeam?: Team | { channels: GuildedDMChannel[] }) {
    this.id = id;
    if (storedTeam) {
      this.channels = storedTeam.channels;
      this.categories = (storedTeam as any)?.categories || [];
    }
  }

  async init({
    name,
    isAdmin = false,
    ownerId = "",
    subdomain = "",
    profilePicture = "",
    teamDashImage = "",
  }: {
    name: string;
    isAdmin: boolean;
    ownerId?: string;
    subdomain?: string;
    profilePicture?: string;
    teamDashImage?: string;
  }) {
    this.name = name;
    this.ownerId = ownerId;
    this.isAdmin = isAdmin;
    this.subdomain = subdomain;
    this.profilePicture = profilePicture;
    this.teamDashImage = teamDashImage;
    if (!this.channels?.length) {
      const { channels, categories, temporalChannels } = (await FetchApi({
        route: `team/${this.id}`,
      })) as GuildedTeam;
      console.log({ temporalChannels });
      this.channels = [...channels, ...temporalChannels];
      this.categories = categories;
    }
  }

  static GetTeamByName(name: string, teams: Team[]) {
    for (const team of teams.values()) {
      if (team.name === name) return team;
    }
    return null;
  }
}

interface GuildedTeam {
  channels: GuildedTeamChannel[];
  categories: GuildedTeamCategory[];
  temporalChannels: GuildedChannel[];
}

interface GuildedTeamCategory {
  id: number;
  name: string;
  priority: number;
  roles: null;
  rolesById: {};
  teamId: string;
  createdAt: string;
  updatedAt: string | null;
  groupId: string;
  channelCategoryId: string | null;
  userPermissions: null;
}
