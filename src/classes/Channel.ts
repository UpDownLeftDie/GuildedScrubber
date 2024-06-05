import { MODES } from "./Settings";

enum ChannelType {
  TEAM = "Team",
  DM = "DM",
}

export enum ChannelContentType {
  // CHAT CHANNELS
  CHAT = "chat",
  STREAM = "stream",
  VOICE = "voice",
  // TOPIC CHANNELS
  ANNOUNCEMENT = "announcement",
  FORUM = "forum",
  // Delete only
  DOC = "doc",
  EVENT = "event",
  LIST = "list",
  MEDIA = "media",
}

export default class Channel {
  static FilterChannelsByMode(channelsArray: GuildedChannel[], mode: MODES) {
    const editableChannels = [...Channel.CHAT_CHANNELS, ...Channel.TOPIC_CHANNELS];
    const channels: GuildedChannel[] = [];
    channelsArray.forEach((channel) => {
      if (mode !== MODES.DELETE && !editableChannels.includes(channel.contentType)) {
        return;
      }
      channels.push(channel);
    });

    return channels;
  }

  static CHAT_CHANNELS = [
    ChannelContentType.CHAT,
    ChannelContentType.STREAM,
    ChannelContentType.VOICE,
  ];
  static TOPIC_CHANNELS = [ChannelContentType.ANNOUNCEMENT, ChannelContentType.FORUM];
  static DELETE_CHANNELS = [
    ChannelContentType.DOC,
    ChannelContentType.EVENT,
    ChannelContentType.LIST,
    ChannelContentType.MEDIA,
  ];
}

export type GuildedChannel = GuildedTeamChannel | GuildedDMChannel;

interface BasicGuildedChannel {
  teamName?: string;
  id: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  archivedAt: string | null;
  parentChannelId: string | null;
  autoArchiveAt: string | null;
  deletedAt: string | null;
  archivedBy: string | null;
  createdByWebhookId: string | null;
  archivedByWebhookId: string | null;
}

export interface GuildedTeamChannel extends BasicGuildedChannel {
  type: ChannelType.TEAM;
  teamId: string;
  priority: number;
  name: string;
  description: string | null;
  settings: null;
  roles: null;
  rolesById: {};
  tournamentRolesById: {};
  channelCategoryId: number;
  addedAt: string;
  channelId: string;
  isRoleSynced: boolean;
  isPublic: boolean;
  groupId: string;
  contentType: ChannelContentType;
  userPermissions: null;
  tournamentRoles: null;
}

export interface GuildedDMChannel extends BasicGuildedChannel {
  type: ChannelType.DM;
  name: string; // | null;
  description: null;
  contentType: ChannelContentType.CHAT;
  ownerId: string;
  dmType: "Default" | "Group";
  DMType: "Default" | "Group";
  users: {
    id: string;
    name: string;
    badges: string[];
    nickname: null;
    subdomain: string;
    addedAt: string;
    isOwner: boolean;
    channelId: string;
    removedAt: string | null;
    profilePicture: string;
    moderationStatus: null;
    profileBannerBlur: string;
    stonks: number;
    userPresenceStatus: number;
  }[];
  lastMessage: {
    id: string;
    content: any;
    type: string;
    createdBy: string;
    createdAt: string;
    editedAt: string | null;
    deletedAt: string | null;
    webhookId: string | null;
    isSilent: false;
    isPrivate: false;
  };
}
