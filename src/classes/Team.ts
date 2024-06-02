import FetchApi from "./FetchApi";

export default class Team {
  id: string;
  channels: any;
  categories: any;
  name: string = "";
  ownerId: string = "";
  isAdmin: boolean = false;
  subdomain: string = "";
  profilePicture: string = "";
  teamDashImage: string = "";

  constructor(id: string, storedTeam?: Team) {
    this.id = id;
    if (storedTeam) {
      this.channels = storedTeam.channels;
      this.categories = storedTeam.categories;
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
      const { channels, categories } = await FetchApi({
        route: `team/${this.id}`,
      });
      this.channels = channels;
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
