import Settings, { MODES } from './Settings';
export default class Channel {
  static FilterChannelsByMode(channelsArray, mode: MODES) {
    const editableChannels = [
      ...Channel.CHAT_CHANNELS,
      ...Channel.TOPIC_CHANNELS,
    ];
    const channels = new Map();
    channelsArray.forEach((channel) => {
      if (
        mode !== MODES.DELETE &&
        !editableChannels.includes(channel.contentType)
      ) {
        return;
      }
      channels.set(channel.id, channel);
    });

    return channels;
  }

  static CHANNEL_TYPES = {
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

  static CHAT_CHANNELS = [
    Channel.CHANNEL_TYPES.CHAT,
    Channel.CHANNEL_TYPES.STREAM,
    Channel.CHANNEL_TYPES.VOICE,
  ];
  static TOPIC_CHANNELS = [
    Channel.CHANNEL_TYPES.ANNOUNCEMENT,
    Channel.CHANNEL_TYPES.FORUM,
  ];
  static DELETE_CHANNELS = [
    Channel.CHANNEL_TYPES.DOC,
    Channel.CHANNEL_TYPES.EVENT,
    Channel.CHANNEL_TYPES.LIST,
    Channel.CHANNEL_TYPES.MEDIA,
  ];
}
