import { GuildedChannel, GuildedTeamChannel } from "./Channel";
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

  constructor(id: string) {
    this.id = id;
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
      const res = (await FetchApi({
        route: `team/${this.id}`,
      })) as { channels: GuildedTeamChannels; groups: GuildedTeamGroup[] };
      const { channels: teamChannels, groups: teamGroups } = res;
      const { temporalChannels, categories } = teamChannels;

      const categoriesMap = Team.GetTeamCategoryMap(categories);
      const groupMap = Team.GetTeamGroupMap(teamGroups);
      const channels = teamChannels.channels
        .map((channel) => {
          if (channel.channelCategoryId) {
            channel.channelCategory = categoriesMap.get(channel.channelCategoryId)?.name || null;
          }
          if (channel.groupId) {
            channel.groupName = groupMap.get(channel.groupId)?.name.trim() || null;
          }
          return channel;
        })
        .sort((a, b) => {
          const aOrder = groupMap.get(a.groupId)?.sortOrder ?? 9999;
          const bOrder = groupMap.get(b.groupId)?.sortOrder ?? 9999;
          if (aOrder > bOrder) return 1;
          if (aOrder < bOrder) return -1;

          if (a.priority < b.priority) return 1;
          if (a.priority > b.priority) return -1;
          return 0;
        });

      this.channels = channels; //[...channels, ...temporalChannels];
      this.categories = categories;
    }
  }

  static GetTeamByName(name: string, teams: Team[]) {
    for (const team of teams.values()) {
      if (team.name === name) return team;
    }
    return null;
  }

  static GetTeamCategoryMap(teamCategories: GuildedTeamCategory[]) {
    const categoryMap: Map<number, GuildedTeamCategory> = new Map();
    teamCategories.forEach((category) => {
      categoryMap.set(category.id, category);
    });
    return categoryMap;
  }

  static GetTeamGroupMap(teamGroups: GuildedTeamGroup[]) {
    const groupMap: Map<string, GuildedTeamGroup> = new Map();
    teamGroups.forEach((group, i) => {
      group.sortOrder = i;
      groupMap.set(group.id, group);
    });
    return groupMap;
  }
}

export interface GuildedTeamChannels {
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

export interface GuildedTeamGroup {
  id: string;
  name: string;
  description: string | null;
  priority: number | null;
  type: "team";
  avatar: string | null;
  banner: string | null;
  teamId: string;
  gameId: string | null;
  visibilityTeamRoleId: null;
  membershipTeamRoleId: number;
  isBase: false;
  additionalGameInfo: {};
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  customReactionId: null;
  isPublic: boolean;
  archivedAt: string | null;
  archivedBy: string | null;
  membershipUpdates: [];
  additionalMembershipTeamRoleIds: null;
  additionalVisibilityTeamRoleIds: null;
  membershipTeamRoleIds: number[];
  visibilityTeamRoleIds: string[];
  sortOrder: number;
}
