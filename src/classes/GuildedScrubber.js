import Announcements from './AnnouncementChannel';
import ChatChannel from './ChatChannel';
import ForumChannel from './ForumChannel';

const CHANNEL_TYPES = {
  // CHAT CHANNELS
  CHAT: 'chat',
  STREAM: 'stream',
  VOICE: 'voice',
  // TOPIC CHANNELS
  ANNOUNCEMENT: 'announcement',
  FORUM: 'forum',
  // Delete only
  DOC: 'doc',
  EVENT: 'event',
  LIST: 'list',
  MEDIA: 'media',
};

const CHAT_CHANNELS = [
  CHANNEL_TYPES.CHAT,
  CHANNEL_TYPES.STREAM,
  CHANNEL_TYPES.VOICE,
];
const TOPIC_CHANNELS = [CHANNEL_TYPES.ANNOUNCEMENT, CHANNEL_TYPES.FORUM];
const DELETE_CHANNELS = [
  CHANNEL_TYPES.DOC,
  CHANNEL_TYPES.EVENT,
  CHANNEL_TYPES.LIST,
  CHANNEL_TYPES.MEDIA,
];

export default class GuildedScrubber {
  static FilterChannelsByMode(channels, mode) {
    if (mode === this.MODES.DELETE) {
      return channels;
    }

    const editableChannels = [...CHAT_CHANNELS, ...TOPIC_CHANNELS];
    return channels.filter((channel) => {
      return editableChannels.includes(channel.contentType);
    });
  }

  static async ScrubChannels(
    userId,
    channels,
    mode,
    passphrase,
    beforeDate,
    afterDate,
    setChannelsCount,
    setAction,
  ) {
    const beforeDateStr = beforeDate && beforeDate.toISOString();
    const afterDateStr = afterDate && afterDate.toISOString();
    let totalItemCount = 0;
    for (const [i, channel] of channels.entries()) {
      setChannelsCount(i + 1);
      totalItemCount += await this.ScrubChannel({
        userId,
        channelId: channel.id,
        channelType: channel.type,
        mode,
        passphrase,
        beforeDate: beforeDateStr,
        afterDate: afterDateStr,
        setAction,
      });
    }
    setAction(
      `Done! Scrubbed ${totalItemCount} messages in ${channels.size} channels.`,
    );
  }

  static async ScrubChannel({
    userId,
    channelId,
    channelType,
    mode,
    passphrase,
    beforeDate,
    afterDate,
    setAction,
  }) {
    let itemCount = 0;
    const deleteMode = mode === this.MODES.DELETE;
    const decryptMode = mode === this.MODES.DECRYPT;

    if (CHAT_CHANNELS.includes(channelType)) {
      const messageLimit = 100;
      itemCount += await ChatChannel.Process({
        userId,
        channelId,
        beforeDate,
        afterDate,
        passphrase,
        setAction,
        deleteMode,
        decryptMode,
        messageLimit,
      });
    } else if (channelType === CHANNEL_TYPES.ANNOUNCEMENT) {
      const maxItems = 1000;
      itemCount += await Announcements.Process({
        userId,
        channelId,
        beforeDate,
        afterDate,
        passphrase,
        setAction,
        deleteMode,
        decryptMode,
        maxItems,
      });
    } else if (channelType === CHANNEL_TYPES.FORUM) {
      const maxItems = 1000;
      itemCount += await ForumChannel.Process({
        userId,
        channelId,
        passphrase,
        setAction,
        deleteMode,
        decryptMode,
        maxItems,
      });
    } else if (DELETE_CHANNELS.includes(channelType)) {
    }
    return itemCount;
  }
}
