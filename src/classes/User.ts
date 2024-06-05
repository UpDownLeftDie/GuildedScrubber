import Cookies from "js-cookie";
import { Team } from ".";
import { GuildedDMChannel } from "./Channel";
import FetchApi from "./FetchApi";
import Settings from "./Settings";

export default class User {
  hmac: any;
  guildedUser!: GuildedUser;
  teams: Team[];
  dms!: Team;
  settings: Settings;
  id!: string;
  name!: string;
  joinDate!: Date;
  lastOnline!: Date;

  constructor() {
    this.hmac = (Cookies.get("guilded-hmac") || "").trim();
    this.settings = new Settings();
    this.teams = [];
  }

  async LoadUser(hmac: string): Promise<User> {
    this.#setHmac(hmac);
    const guildedUser = (await FetchApi({ route: "user" })) as GuildedUser;

    this.guildedUser = guildedUser;
    this.id = guildedUser.id;
    this.name = guildedUser.name;
    this.joinDate = new Date(guildedUser.joinDate);
    this.lastOnline = new Date(guildedUser.lastOnline);
    this.settings.afterDate = this.joinDate;
    this.settings.beforeDate = this.lastOnline;
    this.teams = await this.LoadTeams(guildedUser.teams);
    this.dms = await this.LoadDMs();
    return this;
  }

  async LoadDMs() {
    const dmChannels = (await FetchApi({
      route: `user/${this.id}/dms`,
    })) as GuildedDMChannel[];
    const channels = dmChannels.map((channel) => {
      if (channel.name) return channel;
      const users = channel.users.filter((user) => user.id !== this.id).map((user) => user.name);
      const name = users.length ? users.join(", ") : "You";
      channel.name = name;
      return channel;
    });
    const dms = new Team("DMs", { channels });
    dms.init({ name: "DMs", isAdmin: false });
    this.dms = dms;

    this.#saveDms(this.dms);

    return dms;
  }

  async LoadTeams(guildedUserTeams: GuildedUserTeam[]): Promise<Team[]> {
    const userTeams = new Map(
      guildedUserTeams.map((team) => {
        return [team.id, team];
      }),
    );
    const storedTeams = this.#loadTeams();

    const teams: Team[] = [];
    for (const [teamId, userTeam] of userTeams.entries()) {
      const team = new Team(
        teamId,
        storedTeams.find((storedTeam) => storedTeam.id === teamId),
      );
      await team.init(userTeam);
      teams.push(team);
      teamId;
      this.#saveTeams(teams);
    }

    return teams;
  }

  #loadTeams(): Team[] {
    return JSON.parse(localStorage.getItem("teams") || "[]");
  }

  #saveTeams(teams: Team[]): void {
    localStorage.setItem("teams", JSON.stringify(teams));
  }

  #loadDms(): Team[] {
    return JSON.parse(localStorage.getItem("dms") || "[]");
  }

  #saveDms(dms: Team): void {
    localStorage.setItem("dms", JSON.stringify(dms));
  }

  #setHmac(hmac: string) {
    Cookies.set("guilded-hmac", hmac.trim());
    this.hmac = hmac;
  }
}

export interface GuildedUser {
  id: string;
  name: string;
  joinDate: string;
  lastOnline: string;
  teams: GuildedUserTeam[];
}

export interface GuildedUserTeam {
  id: string;
  name: string;
  subdomain: string;
  bio: string | null;
  timezone: string;
  description: string | null;
  type: string;
  visibility: string;
  createdAt: string;
  ownerId: string;
  profilePicture: string;
  teamDashImage: string;
  homeBannerImageSm: string;
  homeBannerImageMd: string;
  homeBannerImageLg: string;
  additionalInfo: {
    gameId: string;
    source: string;
    platform: string;
  };
  additionalGameInfo: any;
  teamPreferences: null;
  socialInfo: {
    twitch?: string;
    twitter?: string;
    youtube?: string;
    facebook?: string;
  };
  isRecruiting: boolean;
  isVerified: boolean;
  isPro: boolean;
  isPublic: boolean;
  notificationPreference: string;
  flair: {
    id: number;
  }[];
  membershipRole: string;
  roleIds: number[];
  isFavorite: boolean;
  games: number[];
  memberCount: string;
  canInviteMembers: boolean;
  canUpdateTeam: boolean;
  canManageBots: boolean;
  canManageTournaments: boolean;
  canRegisterForTournaments: boolean;
  viewerIsMember: boolean;
  isAdmin: boolean;
  rolesById: {};
}
