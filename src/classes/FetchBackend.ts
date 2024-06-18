import HTTPMethod from "http-method-enum";
import { GuildedDMChannel } from "./Channel";
import { GuildedMessageTypes } from "./Message";
import { GuildedTeamChannels, GuildedTeamGroup } from "./Team";
import { GuildedUser } from "./User";

export default class FetchBackend {
  static Channels = {
    GET: async function ChannelsGET<T>(
      channelId: string,
      channelType: string,
      headers?: HeadersInit,
    ): Promise<T[]> {
      return fetchBackend({ route: `channels/${channelId}/${channelType}`, headers });
    },
    PUT: async function ChannelsPUT<T>(
      channelId: string,
      channelType: string,
      entityId: string,
      data?: GuildedMessageTypes,
    ): Promise<T[]> {
      return fetchBackend({
        route: `channels/${channelId}/${channelType}/${entityId}`,
        method: HTTPMethod.PUT,
        data,
      });
    },
    DELETE: async function ChannelsDELETE<T>(
      channelId: string,
      channelType: string,
      entityId: string,
    ): Promise<T[]> {
      return fetchBackend({
        route: `channels/${channelId}/${channelType}/${entityId}`,
        method: HTTPMethod.DELETE,
      });
    },
  };

  static Team = {
    GET: async function TeamGET(teamId: string): Promise<{
      channels: GuildedTeamChannels;
      groups: GuildedTeamGroup[];
    }> {
      return fetchBackend({ route: `team/${teamId}` });
    },
  };

  static User = {
    GET_SELF: async function SelfUser(): Promise<GuildedUser> {
      return fetchBackend({ route: `user` });
    },
    GET_DMS: async function UserDMs(userId: string): Promise<GuildedDMChannel[]> {
      return fetchBackend({ route: `user/${userId}/dms` });
    },
  };
}

async function fetchBackend({
  route,
  method = HTTPMethod.GET,
  headers,
  data,
}: {
  route: string;
  method?: string;
  headers?: HeadersInit;
  data?: any;
}) {
  const res = await fetch(`/api/${route}`, {
    method,
    headers,
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  if (res.ok) {
    try {
      return res.json();
    } catch (error) {
      return res.text();
    }
  }
}
