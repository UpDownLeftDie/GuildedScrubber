import { Dispatch, SetStateAction } from "react";
import Channel, { ChannelContentType } from "./Channel";
import { AnnouncementChannel, ChatChannel, ForumChannel, SchedulingChannel } from "./Channels";
import { MODES } from "./Settings";
import User from "./User";

const { CHAT_CHANNELS } = Channel;

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
    let limit = 100;

    const processParams = {
      user,
      channelId,
      setAction,
      deleteMode,
      decryptMode,
      limit,
    };
    if (channelContentType === ChannelContentType.ANNOUNCEMENT) {
      itemCount += await AnnouncementChannel.Process(processParams);
    } else if (channelContentType === ChannelContentType.FORUM) {
      itemCount += await ForumChannel.Process(processParams);
    } else if (channelContentType === ChannelContentType.SCHEDULING) {
      itemCount += await SchedulingChannel.Process(processParams);
    } else if (CHAT_CHANNELS.includes(channelContentType)) {
      itemCount += await ChatChannel.Process(processParams);
    }
    return itemCount;
  }
}
