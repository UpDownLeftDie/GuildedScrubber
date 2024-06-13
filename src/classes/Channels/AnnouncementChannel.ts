import { Message, User } from "@/classes";
import { ChannelType } from "@/services/ChannelService";
import { Dispatch, SetStateAction } from "react";
import { GuildedMessageContent } from "../Message";

export default class AnnouncementChannel {
  static async Process({
    user,
    channelId,
    setAction,
    deleteMode,
    decryptMode,
    limit,
  }: {
    user: User;
    channelId: string;
    setAction: Dispatch<SetStateAction<string>>;
    deleteMode: boolean;
    decryptMode: boolean;
    limit: number;
  }) {
    const { settings } = user;
    const { secretKey } = settings;
    let { beforeDate, afterDate } = settings;
    let announcements = [];
    let announcementCount = 0;
    do {
      setAction("Loading announcements and replies");
      const announcements = await Message.GetMessages<Announcement>(
        channelId,
        ChannelType.ANNOUNCEMENTS,
        {
          beforeDate,
          afterDate,
          maxItems: limit,
        },
      );
      if (!announcements?.length) break;
      beforeDate = new Date(announcements[announcements.length - 1].createdAt);
      console.log({ announcements });

      announcementCount += await AnnouncementChannel.HandleReplies(announcements);

      const filteredAnnouncements = Message.FilterByUserAndMode(
        user.id,
        announcements,
        decryptMode,
        deleteMode,
      );
      if (!filteredAnnouncements?.length) continue;
      announcementCount += filteredAnnouncements.length;

      let newAnnouncements;
      const texts = Message.GetTextFromContent(filteredAnnouncements);
      if (decryptMode) {
        setAction("Decrypting messages");
        newAnnouncements = Message.DecryptTexts(texts, secretKey);
      } else if (deleteMode) {
        setAction("Prepping announcement for delete");
        newAnnouncements = Message.PrivateEditTexts(texts);
      } else {
        setAction("Encrypting announcement");
        newAnnouncements = Message.EncryptTexts(texts, secretKey);
      }

      // await AnnouncementChannel.UpdateAnnouncement(channelId, newAnnouncements);
      if (deleteMode) {
        setAction("Deleting messages");
        // await AnnouncementChannel.DeleteAnnouncement(channelId, newAnnouncements);
      }
    } while (announcements?.length >= limit);
    return announcementCount;
  }

  static async HandleReplies(announcements: any) {
    // TODO: this function
    return 0;
  }
}

export interface Announcement {
  id: string;
  title: string;
  content: GuildedMessageContent;
  visibility: string;
  slug: string | null;
  replies: {
    id: number;
    message?: GuildedMessageContent;
    gameId: string | null;
    teamId: string;
    editedAt: string | null;
    contentId: number;
    createdAt: string;
    createdBy: string;
  }[];
  reactions: {
    reactedUsers: string[];
    reactionId: number;
    customReactionId: number;
    createdAt: string;
    customReaction: {
      id: number;
      name: string;
      png: string;
      webp: string;
      apng: string | null;
      teamId: number;
    };
  }[];
  createdAt: string;
  editedAt: string | null;
  createdBy: string;
  teamId: string;
  gameId: string | null;
  channelId: string;
  deletedAt: string | null;
  isPublic: boolean;
  robloxModeratedAt: string | null;
  robloxModerationStatus: string | null;
  robloxModerationReason: string | null;
  isPinned: boolean;
  groupId: string;
}
