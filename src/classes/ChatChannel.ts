import Messages from "./Messages";
import FetchApi from "./FetchApi";

export default class ChatChannel {
  static async UpdateMessages(channelId: string, messages) {
    for (const [messageId, data] of Object.entries(messages)) {
      await FetchApi({
        route: `channel/${channelId}/message/${messageId}`,
        method: "PUT",
        data,
      });
    }
  }

  static async DeleteMessages(channelId: string, messages) {
    for (const [messageId] of Object.entries(messages)) {
      await FetchApi({
        route: `channel/${channelId}/message/${messageId}`,
        method: "DELETE",
      });
    }
  }

  static async Process({ user, channelId, setAction, deleteMode, decryptMode, messageLimit }) {
    const { settings } = user;
    const { secretKey } = settings;
    let { beforeDate, afterDate } = settings;
    let messages = { length: 9999999 };
    let messageCount = 0;
    let temp = 0;
    while (messages?.length >= messageLimit) {
      setAction("Loading messages");
      const messages = await FetchApi({
        route: `channel/${channelId}/messages`,
        headers: {
          ...(beforeDate && { "before-date": beforeDate }),
          ...(afterDate && { "after-date": afterDate }),
          ...(messageLimit && { "message-limit": messageLimit }),
        },
      });

      if (!messages?.length) break;
      beforeDate = messages[messages.length - 1].createdAt;

      const filteredMessages = Messages.FilterByUserAndMode(
        user.id,
        messages,
        decryptMode,
        deleteMode,
      );
      if (!filteredMessages?.length) {
        continue;
      }
      messageCount += filteredMessages.length;

      let newMessages;
      const texts = Messages.GetTextFromContent(filteredMessages);
      if (decryptMode) {
        setAction("Decrypting messages");
        newMessages = Messages.DecryptTexts(texts, secretKey);
      } else {
        setAction(deleteMode ? "Prepping message for delete" : "Encrypting messages");
        newMessages = Messages.EncryptTexts(texts, secretKey, deleteMode);
      }

      await ChatChannel.UpdateMessages(channelId, newMessages);
      if (deleteMode) {
        setAction("Deleting messages");
        await ChatChannel.DeleteMessages(channelId, newMessages);
      }
    }
    return messageCount;
  }
}
