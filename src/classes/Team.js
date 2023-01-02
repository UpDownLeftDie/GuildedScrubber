import FetchApi from './FetchApi';

export default class Team {
  constructor(id, storedTeam) {
    this.id = id;
    if (storedTeam) {
      this.channels = storedTeam.channels;
      this.categories = storedTeam.categories;
    }
  }

  async init(userTeam) {
    const { name, isAdmin, ownerId, subdomain, profilePicture, teamDashImage } =
      userTeam;
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

  static GetTeamByName(name, teams) {
    for (const team of teams.values()) {
      if (team.name === name) return team;
    }
    return null;
  }
}
