import { Message, User } from "@/classes";
import { Dispatch, SetStateAction } from "react";
import { ChannelEndpoint } from "../Channel";
import { GuildedMessageContent, GuildedMessageContentsById } from "../Message";

export default class ListChannel {
  static async Process({
    user,
    channelId,
    setAction,
    deleteMode,
    decryptMode,
    maxItems = 100,
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
    let messages: ListItem[];
    let messageCount = 0;
    do {
      setAction("Loading messages");
      messages = await Message.GetMessages(channelId, ChannelEndpoint.LIST_ITEMS, {
        beforeDate,
        afterDate,
        maxItems,
      });

      if (!messages?.length) break;
      beforeDate = new Date(messages[messages.length - 1].createdAt);

      const filteredMessages = Message.FilterByUserAndMode<ListItem>(
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
      const texts = Message.GetTextFromContent<ListItem>(filteredMessages);
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

      await Message.UpdateMessages(channelId, ChannelEndpoint.LIST_ITEMS, newMessages);
      if (deleteMode) {
        setAction("Deleting messages");
        await Message.DeleteMessages(channelId, ChannelEndpoint.LIST_ITEMS, newMessages);
      }
    } while (messages?.length >= maxItems);
    return messageCount;
  }
}

export interface ListItem {
  id: string;
  message: GuildedMessageContent;
  priority: number;
  channelId: string;
  createdAt: string;
  createdBy: string;
  hasNote: boolean;
  noteCreatedBy: string;
  noteCreatedAt: string;
  noteUpdatedBy: string | null;
  noteUpdatedAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  completedBy: string | null;
  completedAt: string | null;
  deletedBy: string | null;
  deletedAt: string | null;
  parentId: string | null;
  teamId: string;
  webhookId: string | null;
  assignedTo: string[];
}
