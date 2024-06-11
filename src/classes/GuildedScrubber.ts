import { Dispatch, SetStateAction } from "react";
import Channel, { ChannelContentType } from "./Channel";
import { AnnouncementChannel, ChatChannel, ForumChannel, SchedulingChannel } from "./Channels";
import { MODES } from "./Settings";
import User from "./User";

const { CHAT_CHANNELS, TOPIC_CHANNELS, DELETE_CHANNELS } = Channel;

export default class GuildedScrubber {
  static async ScrubChannels(
    user: User,
    setChannelsCount: Dispatch<SetStateAction<number>>,
    setAction: Dispatch<SetStateAction<string>>,
    setHistory: Dispatch<SetStateAction<{}>>,
  ) {
    const { settings } = user;
    const { mode, selectedChannels: channels } = settings;

    let totalItemCount = 0;
    for (const [i, channel] of Array.from(channels).entries()) {
      setChannelsCount(i + 1);
      totalItemCount += await GuildedScrubber.ScrubChannel({
        user,
        channelId: channel.id,
        channelContentType: channel.contentType,
        mode,
        setAction,
      });
    }
    setAction(`Done! Scrubbed ${totalItemCount} messages in ${channels.size} channels.`);
  }

  static async ScrubChannel({
    user,
    channelId,
    channelContentType,
    mode,
    setAction,
  }: {
    user: User;
    channelId: string;
    channelContentType: ChannelContentType;
    mode: MODES;
    setAction: Dispatch<SetStateAction<string>>;
  }) {
    let itemCount = 0;
    const deleteMode = mode === MODES.DELETE;
    const decryptMode = mode === MODES.DECRYPT;

    if (CHAT_CHANNELS.includes(channelContentType)) {
      const messageLimit = 100;
      itemCount += await ChatChannel.Process({
        user,
        channelId,
        setAction,
        deleteMode,
        decryptMode,
        messageLimit,
      });
    } else if (channelContentType === ChannelContentType.ANNOUNCEMENT) {
      const maxItems = 100;
      itemCount += await AnnouncementChannel.Process({
        user,
        channelId,
        setAction,
        deleteMode,
        decryptMode,
        maxItems,
      });
    } else if (channelContentType === ChannelContentType.FORUM) {
      const maxItems = 100;
      itemCount += await ForumChannel.Process({
        user,
        channelId,
        setAction,
        deleteMode,
        decryptMode,
        maxItems,
      });
    } else if (channelContentType === ChannelContentType.SCHEDULING) {
      const messageLimit = 100;
      itemCount += await SchedulingChannel.Process({ user, channelId, setAction, messageLimit });
    } else if (DELETE_CHANNELS.includes(channelContentType)) {
    }
    return itemCount;
  }
}
