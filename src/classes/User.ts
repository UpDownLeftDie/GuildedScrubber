import Cookies from "js-cookie";
import { Team } from ".";
import FetchApi from "./FetchApi";
import Settings from "./Settings";

interface GuildedUser {
  id: string;
  name: string;
  teams: GuildedUserTeam[];
}
interface GuildedUserTeam {
  id: string;
}
interface GuildedDMChannel {
  name: string;
  users: GuildedUser[];
}

export default class User {
  hmac: any;
  guildedUser: {};
  teams: Map<string, Team>;
  settings: Settings;
  id: string;
  name: string;

  constructor() {
    this.hmac = Cookies.get("guilded-hmac") || "";
    this.guildedUser = {};
    this.settings = new Settings();
    this.teams = new Map();
    this.id = "";
    this.name = "";
  }

  async LoadUser(hmac: string) {
    this.#setHmac(hmac);
    const guildedUser = (await FetchApi({ route: "user" })) as GuildedUser;

    this.guildedUser = guildedUser;
    this.id = guildedUser.id;
    this.name = guildedUser.name;
    this.teams = await this.LoadTeams(guildedUser.teams);
  }

  async LoadDMs() {
    if (this?.teams?.has("DMs")) return;

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
    this.teams.set("DMs", dms);

    this.#saveTeams(this.teams);
  }

  async LoadTeams(guildedUserTeams: GuildedUserTeam[]): Promise<Map<string, Team>> {
    const userTeams = new Map(
      guildedUserTeams.map((team) => {
        return [team.id, team];
      }),
    );
    const storedTeams = this.#loadTeams();

    const teams = new Map();
    for (const [teamId, userTeam] of userTeams.entries()) {
      const team = new Team(teamId, storedTeams.get(teamId));
      await team.init(userTeam);
      teams.set(teamId, team);

      this.#saveTeams(teams);
    }

    return teams;
  }

  #loadTeams(): Map<string, Team> {
    return new Map(JSON.parse(localStorage.getItem("teams") || "[]"));
  }

  #saveTeams(teams: Map<string, Team>) {
    localStorage.setItem("teams", JSON.stringify(Array.from(teams.entries())));
  }

  #setHmac(hmac: string) {
    Cookies.set("guilded-hmac", hmac);
    this.hmac = hmac;
  }
}
