import { Dispatch, SetStateAction } from "react";
import FetchApi from "./FetchApi";
import Messages, { GuildedMessage, GuildedMessageContentsById } from "./Messages";
import User from "./User";

export default class ChatChannel {
  static async UpdateMessages(channelId: string, messages: GuildedMessageContentsById) {
    for (const [messageId, data] of Object.entries(messages)) {
      await FetchApi({
        route: `channel/${channelId}/message/${messageId}`,
        method: "PUT",
        data,
      });
    }
  }

  static async DeleteMessages(channelId: string, messages: GuildedMessageContentsById) {
    for (const [messageId] of Object.entries(messages)) {
      await FetchApi({
        route: `channel/${channelId}/message/${messageId}`,
        method: "DELETE",
      });
    }
  }

  static async Process({
    user,
    channelId,
    setAction,
    deleteMode,
    decryptMode,
    messageLimit,
  }: {
    user: User;
    channelId: string;
    setAction: Dispatch<SetStateAction<string>>;
    deleteMode: boolean;
    decryptMode: boolean;
    messageLimit: number;
  }) {
    const { settings } = user;
    const { secretKey } = settings;
    let { beforeDate, afterDate } = settings;
    let messages = { length: 9999999 };
    let messageCount = 0;
    while (messages?.length >= messageLimit) {
      setAction("Loading messages");
      const messages = (await FetchApi({
        route: `channel/${channelId}/messages`,
        headers: new Headers([
          ["before-date", beforeDate.toISOString()],
          ["after-date", afterDate.toISOString()],
          ["message-limit", messageLimit.toString()],
        ]),
      })) as GuildedMessage[];

      if (!messages?.length) break;
      beforeDate = new Date(messages[messages.length - 1].createdAt);

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

      let newMessages: GuildedMessageContentsById;
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
