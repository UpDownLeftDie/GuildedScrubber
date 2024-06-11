import { FetchApi, Message, User } from "@/classes";
import { Dispatch, SetStateAction } from "react";

export default class AnnouncementChannel {
  static async Process({
    user,
    channelId,
    setAction,
    deleteMode,
    decryptMode,
    maxItems,
  }: {
    user: User;
    channelId: string;
    setAction: Dispatch<SetStateAction<string>>;
    deleteMode: boolean;
    decryptMode: boolean;
    maxItems: number;
  }) {
    const { settings } = user;
    const { secretKey } = settings;
    let { beforeDate, afterDate } = settings;
    let announcements = [];
    let announcementCount = 0;
    do {
      setAction("Loading announcements and replies");
      const announcements = await FetchApi({
        route: `channel/${channelId}/announcements`,
        headers: new Headers([
          ["before-date", beforeDate.toISOString()],
          ["after-date", afterDate.toISOString()],
          ["max-items", maxItems.toString()],
        ]),
      });
      if (!announcements?.length) break;
      beforeDate = announcements[announcements.length - 1].createdAt;
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
    } while (announcements?.length >= maxItems);
    return announcementCount;
  }

  static async HandleReplies(announcements: any) {
    // TODO: this function
    return 0;
  }
}
