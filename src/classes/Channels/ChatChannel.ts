import { FetchApi, User } from "@/classes";
import { Dispatch, SetStateAction } from "react";
import Message, { GuildedMessage, GuildedMessageContentsById } from "../Message";

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

      const filteredMessages = Message.FilterByUserAndMode(
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
      const texts = Message.GetTextFromContent(filteredMessages);
      if (decryptMode) {
        setAction("Decrypting messages");
        newMessages = Message.DecryptTexts(texts, secretKey);
      } else if (deleteMode) {
        setAction("Prepping message for delete");
        newMessages = Message.PrivateEditTexts(texts);
      } else {
        setAction("Encrypting messages");
        newMessages = Message.EncryptTexts(texts, secretKey);
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
