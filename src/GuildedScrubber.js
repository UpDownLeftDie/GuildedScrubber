import crypto from 'crypto';
const algorithm = 'aes-256-ctr';
const ivSearchStr = ' IV: ';

export default class GuildedScrubber {
  static instance = null;
  static getInstance(guildedFetcher, userId, passphrase) {
    if (GuildedScrubber.instance == null) {
      console.log('NEW SCRUBBER', userId);
      GuildedScrubber.instance = new GuildedScrubber(
        guildedFetcher,
        userId,
        passphrase,
      );
    }

    return GuildedScrubber.instance;
  }

  constructor(guildedFetcher, userId, passphrase) {
    this.guildedFetcher = guildedFetcher;
    this.userId = userId;
    this.secretKey = passphrase;
  }

  async ScrubChannels(channelIds, decryptMode, deleteMode) {
    for (const channelId of channelIds) {
      await this.ScrubChannel(channelId, decryptMode, deleteMode);
    }
  }

  async ScrubChannel(channelId, decryptMode, deleteMode) {
    let messages = [];
    let beforeDate = null;
    const messageLimit = 100;
    do {
      messages = await this.guildedFetcher.GetMessages(
        channelId,
        beforeDate,
        messageLimit,
      );
      if (!messages) break;
      beforeDate = messages[messages.length - 1].createdAt;

      const filteredMessages = this.FilterMessages(
        messages,
        decryptMode || deleteMode,
      );
      console.log({ filteredMessages });
      if (!filteredMessages?.length) continue;

      const texts = GuildedScrubber.GetTextFromMessages(filteredMessages);
      console.log({ texts });
      let newMessages;
      if (decryptMode) {
        newMessages = GuildedScrubber.DecryptTexts(texts, this.secretKey);
      } else {
        newMessages = GuildedScrubber.EncryptTexts(
          texts,
          this.secretKey,
          deleteMode,
        );
      }
      await this.UpdateMessages(channelId, newMessages);
      if (deleteMode) this.DeleteMessages(channelId, newMessages);
    } while (messages?.length >= messageLimit);
  }

  async UpdateMessages(channelId, messages) {
    const messageIds = Object.keys(messages);
    const messageTexts = Object.values(messages);
    for (let i = 0; i < messageIds.length; i++) {
      const data = GuildedScrubber.BuildMessageContent(messageTexts[i]);
      await this.guildedFetcher.UpdateMessage(channelId, messageIds[i], data);
    }
  }

  async DeleteMessages(channelId, messages) {
    const messageIds = Object.keys(messages);
    for (let i = 0; i < messageIds.length; i++) {
      await this.guildedFetcher.DeleteMessage(channelId, messageIds[i]);
    }
  }

  FilterMessages(messages, includeEncryptedMessages = false) {
    const temp = messages.filter(
      (message) => message.createdBy === this.userId,
    );
    console.log(temp, includeEncryptedMessages, this.userId);
    if (includeEncryptedMessages) return temp;
    return temp.filter((message) => {
      const text = GuildedScrubber.FindTextInNodes(
        message.content.document.nodes,
      );
      return text.indexOf(ivSearchStr) === -1;
    });
  }

  static FindTextInNodes(nodes, string, depth = 0) {
    nodes.forEach((node) => {
      if (node.object === 'text') {
        const tempStr = node.leaves
          .reduce((text, leaf) => {
            if (leaf.text) return `${text}${leaf.text} `;
            return text;
          }, '')
          .trim();
        string = `${string} ${tempStr}`;
      } else if (node?.nodes?.length) {
        const tempStr = GuildedScrubber.FindTextInNodes(
          node.nodes,
          string,
          depth + 1,
        );
        string = tempStr;
      }
    });
    return string.trim();
  }

  static GetTextFromMessages(messages) {
    const texts = {};
    for (const message of messages) {
      texts[message.id] = GuildedScrubber.FindTextInNodes(
        message.content.document.nodes,
        '',
      );
    }
    return texts;
  }

  static BuildMessageContent(contentText) {
    return {
      content: {
        object: 'value',
        document: {
          object: 'document',
          data: {},
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              data: {},
              nodes: [
                {
                  object: 'text',
                  leaves: [
                    {
                      object: 'leaf',
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
    };
  }

  static EncryptTexts(texts, secretKey, deleteMode = false) {
    let encryptedTexts = {};
    Object.entries(texts).forEach(([messageId, text]) => {
      if (deleteMode) {
        encryptedTexts[messageId] = '[deleted for privacy]';
      } else {
        encryptedTexts[messageId] = GuildedScrubber.Encrypt(text, secretKey);
      }
    });
    return encryptedTexts;
  }

  static Encrypt(text, secretKey) {
    const iv = crypto.randomBytes(16);
    console.log({ iv });
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return `${encrypted.toString('hex')}${ivSearchStr}${iv.toString('hex')}`;
  }

  static DecryptTexts(texts, secretKey) {
    let decryptedTexts = {};
    Object.entries(texts).forEach((textObj) => {
      const messageId = textObj[0];
      const ivIndex = textObj[1].indexOf(ivSearchStr);
      const iv = Buffer.from(
        textObj[1].slice(ivIndex + 5, textObj[1].length),
        'hex',
      );
      const text = textObj[1].slice(0, ivIndex);

      decryptedTexts[messageId] = GuildedScrubber.Decrypt(text, secretKey, iv);
    });
    return decryptedTexts;
  }

  static Decrypt(text, secretKey, iv) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(text, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString();
  }
}
