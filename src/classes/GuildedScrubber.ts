import Announcements from "./AnnouncementChannel";
import ChatChannel from "./ChatChannel";
import ForumChannel from "./ForumChannel";
import Settings from "./Settings";
import Channel from "./Channel";

const { CHANNEL_TYPES, CHAT_CHANNELS, TOPIC_CHANNELS, DELETE_CHANNELS } = Channel;

export default class GuildedScrubber {
  static async ScrubChannels(user, setChannelsCount, setAction, setHistory) {
    const { settings } = user;
    const { mode, selectedChannels: channels } = settings;

    let totalItemCount = 0;
    for (const [i, channel] of Array.from(channels).entries()) {
      setChannelsCount(i + 1);
      totalItemCount += await this.ScrubChannel({
        user,
        channelId: channel.id,
        channelType: channel.contentType,
        mode,
        setAction,
      });
    }
    setAction(`Done! Scrubbed ${totalItemCount} messages in ${channels.size} channels.`);
  }

  static async ScrubChannel({ user, channelId, channelType, mode, setAction }) {
    let itemCount = 0;
    const deleteMode = mode === Settings.MODES.DELETE;
    const decryptMode = mode === Settings.MODES.DECRYPT;

    if (CHAT_CHANNELS.includes(channelType)) {
      const messageLimit = 100;
      itemCount += await ChatChannel.Process({
        user,
        channelId,
        setAction,
        deleteMode,
        decryptMode,
        messageLimit,
      });
    } else if (channelType === CHANNEL_TYPES.ANNOUNCEMENT) {
      const maxItems = 1000;
      itemCount += await Announcements.Process({
        user,
        channelId,
        setAction,
        deleteMode,
        decryptMode,
        maxItems,
      });
    } else if (channelType === CHANNEL_TYPES.FORUM) {
      const maxItems = 1000;
      itemCount += await ForumChannel.Process({
        user,
        channelId,
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
