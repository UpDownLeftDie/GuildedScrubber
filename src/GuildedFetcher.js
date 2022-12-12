import { v4 as uuidv4 } from 'uuid';

const API_URL = 'https://www.guilded.gg/api';

export default class GuildedFetcher {
  static instance = null;
  static getInstance(hmac) {
    if (GuildedFetcher.instance == null) {
      GuildedFetcher.instance = new GuildedFetcher(hmac);
    }

    return GuildedFetcher.instance;
  }

  constructor(hmac) {
    this.hmac = hmac;
  }

  async LoadUser() {
    const url = `${API_URL}/me?isLogin=true&v2=true`;
    const res = await this._fetchGuilded(url);
    const { teams, user } = res;
    console.log({ teams, user });
    this.userId = user.id;
    user.teams = teams;
    return user;
  }

  async GetTeamChannelsFromTeams(teams) {
    let teamChannels = JSON.parse(localStorage.getItem('teamChannels') || '{}');

    for (const team of teams) {
      if (teamChannels[team]?.length > 0) continue;
      const { channels } = await this.GetTeamChannels(team);
      teamChannels[team] = channels;

      localStorage.setItem('teamChannels', JSON.stringify(teamChannels));
    }
    return JSON.parse(localStorage.getItem('teamChannels'));
  }

  async GetTeamChannels(teamId) {
    const url = `${API_URL}/teams/${teamId}/channels`;
    const res = await this._fetchGuilded(url);
    const { channels } = res;
    return channels;
  }

  async GetDMChannels() {
    let teamChannels = JSON.parse(localStorage.getItem('teamChannels') || '{}');

    const url = `${API_URL}/users/${this.userId}/channels`;
    const res = await this._fetchGuilded(url);
    const { channels } = res;

    teamChannels.dm = channels;
    localStorage.setItem('teamChannels', JSON.stringify(teamChannels));
    return channels;
  }

  async GetMessages(channelId, beforeDate, messageLimit) {
    const url = new URL(`${API_URL}/channels/${channelId}/messages`);
    url.searchParams.append('limit', messageLimit);
    if (beforeDate) url.searchParams.append('beforeDate', beforeDate);
    const res = await this._fetchGuilded(url.href);
    const messages = res.messages;
    console.log('getMessages', { messages });
    return messages;
  }

  async UpdateMessage(channelId, messageId, data) {
    const url = new URL(
      `${API_URL}/channels/${channelId}/messages/${messageId}`,
    );
    return this._fetchGuilded(url, 'PUT', data);
  }

  async DeleteMessage(channelId, messageId) {
    const url = new URL(
      `${API_URL}/channels/${channelId}/messages/${messageId}`,
    );
    return this._fetchGuilded(url, 'DELETE');
  }

  async _fetchGuilded(url, method = 'GET', data) {
    const res = await retryFetch(
      url,
      {
        method,
        headers: {
          authority: 'www.guilded.gg',
          accept: 'application/json, text/javascript, */*; q=0.01',
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          cookie: `hmac_signed_session=${this.hmac}; authenticated=true;`,
          'guilded-client-id': uuidv4(),
          pragma: 'no-cache',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'none',
        },
        ...(data ? { body: JSON.stringify(data) } : {}),
      },
      5,
    ).catch((err) => console.error(err));
    return res.json();
  }
}

async function delay(ms) {
  new Promise((resolve) => setTimeout(() => resolve(), ms));
}
async function retryFetch(
  url,
  fetchOptions = {},
  retries = 5,
  retryDelay = 5000,
  timeout = 30000,
) {
  return new Promise((resolve, reject) => {
    // check for timeout
    if (timeout) setTimeout(() => reject('error: timeout'), timeout);

    const wrapper = (n) => {
      fetch(url, fetchOptions)
        .then(async (res) => {
          if (res.status === 429) {
            await delay(retryDelay);
            wrapper(--n);
          }

          resolve(res);
        })
        .catch(async (err) => {
          if (n > 0) {
            await delay(retryDelay);
            wrapper(--n);
          } else {
            reject(err);
          }
        });
    };

    wrapper(retries);
  });
}
