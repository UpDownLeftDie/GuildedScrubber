import crypto from 'crypto';
const algorithm = 'aes-256-ctr';
const ivSearchStr = ' IV: ';

export default class Messages {
  static FilterByUserAndMode(userId, messages, decryptMode, deleteMode) {
    return messages.filter((message) => {
      if (message.createdBy !== userId) return false; // can't act on other user's messages
      if (deleteMode) return true; // deleting messages so don't care if they're encrypted or not

      // if we're encrypting messages
      if (!decryptMode) {
        const text = findTextInNodes(message.content.document.nodes);
        return !text.includes(ivSearchStr); // don't include messages that are already encrypted
      }
      return true;
    });
  }

  static GetTextFromContent(items) {
    const texts = {};
    for (const item of items) {
      texts[item.id] = {
        text: findTextInNodes(item.content.document.nodes, ''),
        channelId: item.channelId,
      };
    }
    return texts;
  }

  static EncryptTexts(texts, secretKey, deleteMode = false) {
    let encryptedTexts = {};
    Object.entries(texts).forEach(([messageId, messageInfo]) => {
      const text = deleteMode
        ? '[deleted for privacy]'
        : encrypt(messageInfo.text, secretKey);

      encryptedTexts[messageId] = buildMessageContent(text);
    });
    return encryptedTexts;
  }

  static DecryptTexts(texts, secretKey) {
    let decryptedMessageContents = {};
    Object.entries(texts).forEach(([messageId, messageInfo]) => {
      const messageText = messageInfo.text;
      const ivIndex = messageText.indexOf(ivSearchStr);
      const iv = Buffer.from(
        messageText.slice(ivIndex + 5, messageText.length),
        'hex',
      );
      const text = messageText.slice(0, ivIndex);
      decryptedMessageContents[messageId] = buildMessageContent(
        decrypt(text, secretKey, iv),
      );
    });
    return decryptedMessageContents;
  }
}

function findTextInNodes(nodes, string, depth = 0) {
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
      const tempStr = findTextInNodes(node.nodes, string, depth + 1);
      string = tempStr;
    }
  });
  return string.trim();
}

function encrypt(text, secretKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return `${encrypted.toString('hex')}${ivSearchStr}${iv.toString('hex')}`;
}

function decrypt(text, secretKey, iv) {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(text, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString();
}

function buildMessageContent(contentText) {
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
