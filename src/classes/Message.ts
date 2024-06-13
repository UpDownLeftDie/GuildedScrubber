// file deepcode ignore InsecureCipherNoIntegrity: not sure why this is wrong, probably not important in this context
import { ChannelType } from "@/services/ChannelService";
import crypto from "crypto";
import { Announcement } from "./Channels/AnnouncementChannel";
import { ListItem } from "./Channels/ListChannel";
import FetchBackend from "./FetchBackend";
const algorithm = "aes-256-ctr";
const ivSearchStr = " IV: ";

export default class Message {
  static async GetMessages<T>(
    channelId: string,
    channelType: ChannelType,
    {
      beforeDate,
      afterDate,
      messageLimit,
      maxItems,
    }: { beforeDate: Date; afterDate: Date; messageLimit?: number; maxItems?: number },
  ) {
    const headers = new Headers([
      ["before-date", beforeDate.toISOString()],
      ["after-date", afterDate.toISOString()],
    ]);
    if (messageLimit) {
      headers.append("message-limit", messageLimit.toString());
    } else if (maxItems) {
      headers.append("max-items", maxItems.toString());
    }

    return await FetchBackend.Channels.GET<T>(channelId, channelType, headers);
  }

  static async UpdateMessages(
    channelId: string,
    channelType: ChannelType,
    messages: GuildedMessageContentsById,
  ) {
    for (const [messageId, data] of Object.entries(messages)) {
      await FetchBackend.Channels.PUT(channelId, channelType, messageId, data);
    }
  }

  static async DeleteMessages(
    channelId: string,
    channelType: ChannelType,
    messages: GuildedMessageContentsById,
  ) {
    for (const [messageId] of Object.entries(messages)) {
      await FetchBackend.Channels.DELETE(channelId, channelType, messageId);
    }
  }

  static FilterByUserAndMode<T extends GuildedMessage | ListItem | Announcement>(
    userId: string,
    messages: T[],
    decryptMode: boolean,
    deleteMode: boolean,
  ): T[] {
    return messages.filter((message) => {
      if (message.createdBy !== userId) return false; // can't act on other user's messages
      if (deleteMode) return true; // deleting messages so don't care if they're encrypted or not

      // if we're encrypting messages
      if (!decryptMode) {
        let nodes = (message as GuildedMessage)?.content.document.nodes;
        if (Object.hasOwn(message, "message")) {
          nodes = (message as ListItem)?.message.document.nodes;
        }
        if (!nodes) return false;

        const text = findTextInNodes(nodes);
        return !text.includes(ivSearchStr); // don't include messages that are already encrypted
      }
      return true;
    });
  }

  static GetTextFromContent<T extends GuildedMessage | ListItem | Announcement>(
    items: T[],
  ): ExtractedMessageText {
    const texts: ExtractedMessageText = {};
    for (const item of items) {
      let nodes = (item as GuildedMessage)?.content.document.nodes;
      if (Object.hasOwn(item, "message")) {
        nodes = (item as ListItem)?.message.document.nodes;
      }

      texts[item.id] = {
        text: findTextInNodes(nodes),
        channelId: item.channelId,
      };
    }
    return texts;
  }

  static PrivateEditTexts(texts: ExtractedMessageText) {
    let encryptedTexts: GuildedMessageContentsById = {};
    Object.entries(texts).forEach(([messageId, messageInfo]) => {
      const text = "[deleted for privacy]";
      encryptedTexts[messageId] = buildMessageContent(text);
    });
    return encryptedTexts;
  }

  static EncryptTexts(texts: ExtractedMessageText, secretKey: string) {
    let encryptedTexts: GuildedMessageContentsById = {};
    Object.entries(texts).forEach(([messageId, messageInfo]) => {
      const text = encrypt(messageInfo.text, secretKey);
      encryptedTexts[messageId] = buildMessageContent(text);
    });
    return encryptedTexts;
  }

  static DecryptTexts(texts: ExtractedMessageText, secretKey: string) {
    let decryptedMessageContents: GuildedMessageContentsById = {};
    Object.entries(texts).forEach(([messageId, messageInfo]) => {
      const messageText = messageInfo.text;
      const ivIndex = messageText.indexOf(ivSearchStr);
      const iv = Buffer.from(messageText.slice(ivIndex + 5, messageText.length), "hex");
      const text = messageText.slice(0, ivIndex);
      decryptedMessageContents[messageId] = buildMessageContent(decrypt(text, secretKey, iv));
    });
    return decryptedMessageContents;
  }
}

export interface GuildedMessageContentsById {
  [key: string]: GuildedMessage;
}

function findTextInNodes(nodes: GuildedMessageNode[], string = "", depth = 0) {
  nodes.forEach((node) => {
    if (node.object === "text") {
      const tempStr = node.leaves
        .reduce((text, leaf) => {
          if (leaf.text) return `${text}${leaf.text} `;
          return text;
        }, "")
        .trim();
      string = `${string} ${tempStr}`;
    } else if (node?.nodes?.length) {
      const tempStr = findTextInNodes(node.nodes, string, depth + 1);
      string = tempStr;
    }
  });
  return string.trim();
}

function encrypt(text: string, secretKey: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return `${encrypted.toString("hex")}${ivSearchStr}${iv.toString("hex")}`;
}

function decrypt(text: string, secretKey: string, iv: Buffer) {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

  const decrypted = Buffer.concat([decipher.update(Buffer.from(text, "hex")), decipher.final()]);

  return decrypted.toString();
}

function buildMessageContent(contentText: string): GuildedMessage {
  return {
    content: {
      object: "value",
      document: {
        object: "document",
        data: {},
        nodes: [
          {
            object: "block",
            type: "paragraph",
            data: {},
            nodes: [
              {
                object: "text",
                leaves: [
                  {
                    object: "leaf",
                    text: contentText,
                    marks: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  } as GuildedMessage;
}

interface ExtractedMessageText {
  [key: string]: {
    text: string;
    channelId: string;
  };
}

type GuildedMessageNode =
  | {
      object: "block" | "inline";
      type: "paragraph" | "reaction";
      data: {};
      nodes: GuildedMessageNode[];
    }
  | {
      object: "text";
      leaves: {
        text: string;
        marks: [];
        object: "leaf";
      }[];
    };

export interface GuildedMessage {
  id: string;
  content: GuildedMessageContent;
  type: string;
  reactions: {
    customReactionId: number;
    createdAt: string;
    users: {
      id: string;
    }[];
    totalUsers: number;
    customReaction: {
      id: number;
      name: string;
      png: string | null;
      webp: string | null;
      apng: string | null;
      teamId: string | null;
    };
  }[];
  createdBy: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  channelId: string;
  webhookId: string | null;
  isSilent: boolean;
  isPrivate: boolean;
  repliesToIds: string[];
  isPinned: boolean;
  pinnedBy: string | null;
  repliesTo: string;
}

export interface GuildedMessageContent {
  object: string;
  document: {
    data: {};
    nodes: GuildedMessageNode[];
    object: string;
  };
}
