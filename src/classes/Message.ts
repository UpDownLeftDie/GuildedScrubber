// file deepcode ignore InsecureCipherNoIntegrity: not sure why this is wrong, probably not important in this context
import crypto from "crypto";
import { ChannelEndpoint } from "./Channel";
import { Announcement } from "./Channels/AnnouncementChannel";
import { ListItem } from "./Channels/ListChannel";
import FetchBackend from "./FetchBackend";
const algorithm = "aes-256-ctr";
const ivSearchStr = " IV: ";

export type GuildedMessageTypes = GuildedMessage | ListItem | Announcement;

export default class Message {
  static async GetMessages<T>(
    channelId: string,
    channelType: ChannelEndpoint,
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

  static async UpdateMessages(messages: GuildedMessagesById, channelType: ChannelEndpoint) {
    for (const [messageId, data] of Object.entries(messages)) {
      await FetchBackend.Channels.PUT(data.channelId, channelType, messageId, data);
    }
  }

  static async DeleteMessages(messages: GuildedMessagesById, channelType: ChannelEndpoint) {
    for (const [messageId, data] of Object.entries(messages)) {
      await FetchBackend.Channels.DELETE(data.channelId, channelType, messageId);
    }
  }

  static FilterByUserAndMode<T extends GuildedMessageTypes>(
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

  static GetTextFromContent<T extends GuildedMessageTypes>(item: T): ExtractedMessageText {
    let nodes = (item as GuildedMessage)?.content.document.nodes;
    if (Object.hasOwn(item, "message")) {
      nodes = (item as ListItem)?.message.document.nodes;
    }

    return {
      text: findTextInNodes(nodes),
      channelId: item.channelId,
    };
  }

  static PrivateEditGuildedMessage<T extends GuildedMessageTypes>(messages: T[]) {
    let editedTexts: GuildedMessagesById = {};

    messages.forEach((message) => {
      const text = "[deleted for privacy]";
      if (Object.hasOwn(message, "message")) {
        (message as ListItem).message = buildMessageContent(text);
      } else {
        (message as GuildedMessage).content = buildMessageContent(text);
      }
      editedTexts[message.id] = message;
    });
    return editedTexts;
  }

  static EncryptGuildedMessages<T extends GuildedMessageTypes>(messages: T[], secretKey: string) {
    let encryptedTexts: GuildedMessagesById = {};

    messages.forEach((message) => {
      const extractedText = Message.GetTextFromContent(message);
      const text = encrypt(extractedText.text, secretKey);
      if (Object.hasOwn(message, "message")) {
        (message as ListItem).message = buildMessageContent(text);
      } else {
        (message as GuildedMessage).content = buildMessageContent(text);
      }
      encryptedTexts[message.id] = message;
    });
    return encryptedTexts;
  }

  static DecryptGuildedMessages<T extends GuildedMessageTypes>(messages: T[], secretKey: string) {
    let decryptedMessageContents: GuildedMessagesById = {};

    messages.forEach((message) => {
      const extractedText = Message.GetTextFromContent(message);
      if (Object.hasOwn(message, "message")) {
        (message as ListItem).message = Message.#DecryptTexts(extractedText.text, secretKey);
      } else {
        (message as GuildedMessage).content = Message.#DecryptTexts(extractedText.text, secretKey);
      }
      decryptedMessageContents[message.id] = message;
    });
    return decryptedMessageContents;
  }

  static #DecryptTexts(messageText: string, secretKey: string): GuildedMessageContent {
    const ivIndex = messageText.indexOf(ivSearchStr);
    const iv = Buffer.from(messageText.slice(ivIndex + 5, messageText.length), "hex");
    const text = messageText.slice(0, ivIndex);
    return buildMessageContent(decrypt(text, secretKey, iv));
  }
}

export interface GuildedMessagesById {
  [key: string]: GuildedMessageTypes;
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

function buildMessageContent(contentText: string): GuildedMessageContent {
  return {
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
  } as GuildedMessageContent;
}

interface ExtractedMessageText {
  text: string;
  channelId: string;
}

interface ExtractedMessageTexts {
  [key: string]: ExtractedMessageText;
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
