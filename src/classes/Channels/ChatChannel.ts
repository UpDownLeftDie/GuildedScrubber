import { User } from "@/classes";
import { Dispatch, SetStateAction } from "react";
import Message, { GuildedMessage, GuildedMessageContentsById } from "../Message";
import { ChannelEndpoint } from "../Channel";

export default class ChatChannel {
  static async Process({
    user,
    channelId,
    setAction,
    deleteMode,
    decryptMode,
    limit = 100,
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
    let messages: GuildedMessage[];
    let messageCount = 0;
    do {
      setAction("Loading messages");
      messages = await Message.GetMessages<GuildedMessage>(channelId, ChannelEndpoint.MESSAGES, {
        beforeDate,
        afterDate,
        messageLimit: limit,
      });

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

      await Message.UpdateMessages(channelId, ChannelEndpoint.MESSAGES, newMessages);
      if (deleteMode) {
        setAction("Deleting messages");
        await Message.DeleteMessages(channelId, ChannelEndpoint.MESSAGES, newMessages);
      }
    } while (messages?.length >= limit);
    return messageCount;
  }
}
