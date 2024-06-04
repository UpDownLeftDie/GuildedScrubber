import { Dispatch, SetStateAction } from "react";
import { User } from ".";
import FetchApi from "./FetchApi";
import Messages from "./Messages";

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
        headers: {
          ...(beforeDate && { "before-date": beforeDate }),
          ...(afterDate && { "after-date": afterDate }),
          ...(maxItems && { "max-items": maxItems }),
        },
      });
      if (!announcements?.length) break;
      beforeDate = announcements[announcements.length - 1].createdAt;
      console.log({ announcements });

      announcementCount += await AnnouncementChannel.HandleReplies(announcements);

      const filteredAnnouncements = Messages.FilterByUserAndMode(
        user.id,
        announcements,
        decryptMode,
        deleteMode,
      );
      if (!filteredAnnouncements?.length) continue;
      announcementCount += filteredAnnouncements.length;

      let newAnnouncements;
      const texts = Messages.GetTextFromContent(filteredAnnouncements);
      if (decryptMode) {
        setAction("Decrypting messages");
        newAnnouncements = Messages.DecryptTexts(texts, secretKey);
      } else {
        setAction(deleteMode ? "Prepping announcement for delete" : "Encrypting announcement");
        newAnnouncements = Messages.EncryptTexts(texts, secretKey, deleteMode);
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
