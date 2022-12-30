import FetchApi from './FetchApi';
import Messages from './Messages';

export default class AnnouncementChannel {
  async Process({
    userId,
    channelId,
    beforeDate,
    afterDate,
    passphrase,
    setAction,
    deleteMode,
    decryptMode,
    maxItems,
  }) {
    let announcements = [];
    let announcementCount = 0;
    do {
      setAction('Loading announcements and replies');
      const announcements = await FetchApi({
        route: `channel/${channelId}/announcements`,
        headers: {
          ...(beforeDate && { 'before-date': beforeDate }),
          ...(afterDate && { 'after-date': afterDate }),
          ...(maxItems && { 'max-items': maxItems }),
        },
      });
      if (!announcements?.length) break;
      beforeDate = announcements[announcements.length - 1].createdAt;
      console.log({ announcements });

      announcementCount += await AnnouncementChannel.HandleReplies(
        announcements,
      );

      const filteredAnnouncements = Messages.FilterByUserAndMode(
        userId,
        announcements,
        decryptMode,
        deleteMode,
      );
      if (!filteredAnnouncements?.length) continue;
      announcementCount += filteredAnnouncements.length;

      let newAnnouncements;
      const texts = Messages.GetTextFromContent(filteredAnnouncements);
      if (decryptMode) {
        setAction('Decrypting messages');
        newAnnouncements = Messages.DecryptTexts(texts, passphrase);
      } else {
        setAction(
          deleteMode
            ? 'Prepping announcement for delete'
            : 'Encrypting announcement',
        );
        newAnnouncements = Messages.EncryptTexts(texts, passphrase, deleteMode);
      }

      // await AnnouncementChannel.UpdateAnnouncement(channelId, newAnnouncements);
      if (deleteMode) {
        setAction('Deleting messages');
        // await AnnouncementChannel.DeleteAnnouncement(channelId, newAnnouncements);
      }
    } while (announcements?.length >= maxItems);
    return announcementCount;
  }
}
