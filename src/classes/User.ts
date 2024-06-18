import Cookies from "js-cookie";
import FetchBackend from "./FetchBackend";
import Settings from "./Settings";
import Team from "./Team";

export default class User {
  hmac: any;
  guildedUser!: GuildedUser;
  guildedUserTeams!: GuildedUserTeam[];
  teams: Team[];
  dms!: Team;
  settings: Settings;
  id!: string;
  name!: string;
  joinDate!: Date;
  lastOnline!: Date;
  monthBeforeLastOnline!: Date;

  constructor() {
    this.hmac = (Cookies.get("guilded-hmac") || "").trim();
    this.settings = new Settings();
    this.teams = [];
  }

  async LoadUser(hmac: string): Promise<User> {
    this.#setHmac(hmac);
    const guildedUser = await FetchBackend.User.GET_SELF();

    this.guildedUser = guildedUser;
    this.guildedUserTeams = guildedUser.teams;
    this.id = guildedUser.id;
    this.name = guildedUser.name;
    this.joinDate = getRoundedDate(5, new Date(guildedUser.joinDate), Math.floor);

    {
      let lastOnline = new Date(guildedUser.lastOnline);
      lastOnline.setHours(lastOnline.getHours() + 3); // lastOnline doesn't seem to update very frequently
      lastOnline = getRoundedDate(5, lastOnline, Math.ceil);
      this.lastOnline = new Date(lastOnline);

      lastOnline.setMonth(lastOnline.getMonth() - 1);
      this.monthBeforeLastOnline = lastOnline;
    }
    this.settings.afterDate = this.monthBeforeLastOnline;
    this.settings.beforeDate = this.lastOnline;
    // this.teams = await this.LoadTeams(guildedUser.teams);
    // this.dms = await this.LoadDMs();
    return this;
  }

  async LoadDMs(): Promise<Team> {
    const dmChannels = await FetchBackend.User.GET_DMS(this.id);
    const channels = dmChannels
      .map((channel) => {
        if (channel.name) return channel;
        const users = channel.users.filter((user) => user.id !== this.id).map((user) => user.name);
        const name = users.length ? users.join(", ") : "You";
        channel.name = name;
        return channel;
      })
      .sort((a, b) => {
        const aUpdatedAtDate = new Date(a.lastMessage?.createdAt ?? 0).getTime();
        const bUpdatedAtDate = new Date(b.lastMessage?.createdAt ?? 0).getTime();
        if (aUpdatedAtDate > bUpdatedAtDate) return -1;
        if (aUpdatedAtDate < bUpdatedAtDate) return 1;
        return 0;
      });
    const dms = new Team("DMs");
    dms.channels = channels;
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
    const cachedTeams = this.#loadTeams();
    console.log("preload teams", { cachedTeams });

    const teamPromises: Promise<void>[] = [];
    const teams: Team[] = [];
    for (const [teamId, userTeam] of userTeams.entries()) {
      const cachedTeam = cachedTeams.find((cachedTeam) => cachedTeam.id === teamId);
      const team = Object.assign(new Team(teamId), cachedTeam);
      teams.push(team);
      if (!team.channels?.length) {
        teamPromises.push(team.init(userTeam));
      }
    }
    await Promise.all(teamPromises);

    this.#saveTeams(teams);

    return teams;
  }

  #loadTeams(): Team[] {
    return JSON.parse(localStorage.getItem("teams") ?? "[]") as Team[];
  }

  #saveTeams(teams: Team[]): void {
    console.log("saving teams", { teams });
    localStorage.setItem("teams", JSON.stringify(teams));
  }

  #loadDms(): Team {
    return JSON.parse(localStorage.getItem("dms") || "{}") as Team;
  }

  #saveDms(dms: Team): void {
    const storedDms = this.#loadDms();
    localStorage.setItem(
      "dms",
      JSON.stringify({
        ...storedDms,
        ...dms,
      }),
    );
  }

  #setHmac(hmac: string) {
    Cookies.set("guilded-hmac", hmac.trim());
    this.hmac = hmac;
  }
}

function getRoundedDate(minutes: number, date = new Date(), mathFunc = Math.round) {
  let ms = 1000 * 60 * minutes;
  let roundedDate = new Date(mathFunc(date.getTime() / ms) * ms);

  roundedDate.setMilliseconds(0);
  roundedDate.setSeconds(0);

  return roundedDate;
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
