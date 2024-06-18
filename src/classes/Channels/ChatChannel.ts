import { User } from "@/classes";
import { Dispatch, SetStateAction } from "react";
import { ChannelEndpoint } from "../Channel";
import Message, { GuildedMessage, GuildedMessagesById } from "../Message";

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

      let newMessages: GuildedMessagesById;
      if (decryptMode) {
        setAction("Decrypting messages");
        newMessages = Message.DecryptGuildedMessages(filteredMessages, secretKey);
      } else if (deleteMode) {
        setAction("Prepping message for delete");
        newMessages = Message.PrivateEditGuildedMessage(filteredMessages);
      } else {
        setAction("Encrypting messages");
        newMessages = Message.EncryptGuildedMessages(filteredMessages, secretKey);
      }

      console.log({ newMessages });
      await Message.UpdateMessages(newMessages, ChannelEndpoint.MESSAGES);
      if (deleteMode) {
        setAction("Deleting messages");
        await Message.DeleteMessages(newMessages, ChannelEndpoint.MESSAGES);
      }
    } while (messages?.length >= limit);
    return messageCount;
  }
}
