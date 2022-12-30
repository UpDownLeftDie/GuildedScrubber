import Cookies from 'js-cookie';
import { Team } from '.';
import FetchApi from './FetchApi';
import Settings from './Settings';

export default class User {
  constructor() {
    this.hmac = Cookies.get('guilded-hmac') || '';
    this.guildedUser = {};
    this.teams = [];
    this.settings = new Settings();
    this.id = '';
  }

  async LoadUser(hmac) {
    this.#setHmac(hmac);
    const guildedUser = await FetchApi({ route: 'user' });

    this.guildedUser = guildedUser;
    this.id = guildedUser.id;
    this.name = guildedUser.name;
    this.teams = await this.LoadTeams(guildedUser.teams);
  }

  async LoadTeams(guildedUserTeams) {
    const userTeams = new Map(
      guildedUserTeams.map((team) => {
        return [team.id, team];
      }),
    );
    const storedTeams = new Map(
      JSON.parse(localStorage.getItem('teams') || '[]'),
    );

    const teams = new Map();
    for (const [teamId, userTeam] of userTeams.entries()) {
      const team = new Team(teamId, storedTeams.get(teamId));
      await team.init(userTeam);
      teams.set(teamId, team);

      localStorage.setItem(
        'teams',
        JSON.stringify(Array.from(teams.entries())),
      );
    }

    // const filteredTeams = Object.fromEntries(
    //   Object.entries(teams).filter(([teamId]) => {
    //     return teamIds.includes(teamId);
    //   }),
    // );

    return teams;
  }

  #setHmac(hmac) {
    Cookies.set('guilded-hmac', hmac);
    this.hmac = hmac;
  }
}
