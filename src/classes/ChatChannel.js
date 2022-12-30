import Messages from './Messages';
import FetchApi from './FetchApi';

export default class ChatChannel {
  static async UpdateMessages(channelId, messages) {
    for (const [messageId, data] of Object.entries(messages)) {
      const result = await FetchApi({
        route: `channel/${channelId}/message/${messageId}`,
        method: 'PUT',
        data,
      });
    }
  }

  static async DeleteMessages(channelId, messages) {
    const messageIds = Object.keys(messages);
    for (let i = 0; i < messageIds.length; i++) {
      return await FetchApi({
        route: `channel/${channelId}/message/${messageIds[i]}`,
        method: 'DELETE',
      });
    }
  }

  static async Process({
    userId,
    channelId,
    beforeDate,
    afterDate,
    passphrase,
    setAction,
    deleteMode,
    decryptMode,
    messageLimit,
  }) {
    let messages = [];
    let messageCount = 0;
    do {
      setAction('Loading topics');
      const messages = await FetchApi({
        route: `channel/${channelId}/messages`,
        headers: {
          ...(beforeDate && { 'before-date': beforeDate }),
          ...(afterDate && { 'after-date': afterDate }),
          ...(messageLimit && { 'message-limit': messageLimit }),
        },
      });
      if (!messages?.length) break;
      beforeDate = messages[messages.length - 1].createdAt;
      console.log({ messages });

      const filteredMessages = Messages.FilterByUserAndMode(
        userId,
        messages,
        decryptMode,
        deleteMode,
      );
      if (!filteredMessages?.length) continue;
      messageCount += filteredMessages.length;

      let newMessages;
      const texts = Messages.GetTextFromContent(filteredMessages);
      if (decryptMode) {
        setAction('Decrypting messages');
        newMessages = Messages.DecryptTexts(texts, passphrase);
      } else {
        setAction(
          deleteMode ? 'Prepping message for delete' : 'Encrypting messages',
        );
        newMessages = Messages.EncryptTexts(texts, passphrase, deleteMode);
      }

      await ChatChannel.UpdateMessages(channelId, newMessages);
      if (deleteMode) {
        setAction('Deleting messages');
        await ChatChannel.DeleteMessages(channelId, newMessages);
      }
    } while (messages?.length >= messageLimit);
    return messageCount;
  }
}
