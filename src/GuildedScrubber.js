import Cookies from 'js-cookie';
import crypto from 'crypto';
import fetch from 'node-fetch';
const algorithm = 'aes-256-ctr';
const ivSearchStr = ' IV: ';

export default class GuildedScrubber {
  static async FetchApi(route, method = 'GET', body) {
    const hmac = Cookies.get('guilded-hmac');
    return fetch(`/api/${route}`, {
      method,
      headers: {
        hmac,
        'content-type': 'application/json',
      },
    }).then((res) => res.json());
  }

  static async GetAllTeams(teamIds, shouldFetchDMs = false) {
    let teams = JSON.parse(localStorage.getItem('teams') || '{}');

    for (const teamId of teamIds) {
      if (teams[teamId]?.channels?.length > 0) continue;
      const team = await GuildedScrubber.FetchApi(`team/${teamId}`);
      teams[teamId] = team;

      localStorage.setItem('teams', JSON.stringify(teams));
    }
    teams = JSON.parse(localStorage.getItem('teams'));

    const filteredTeams = Object.fromEntries(
      Object.entries(teams).filter(([teamId]) => {
        return teamIds.includes(teamId);
      }),
    );
    console.log({ filteredTeams });

    return filteredTeams;
  }

  static async ScrubChannels(userId, channelIds, decryptMode, deleteMode) {
    for (const channelId of channelIds) {
      await this.ScrubChannel(userId, channelId, decryptMode, deleteMode);
    }
  }

  static async ScrubChannel(userId, channelId, decryptMode, deleteMode) {
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

      const filteredMessages = filterMessages(
        userId,
        messages,
        decryptMode || deleteMode,
      );
      console.log({ filteredMessages });
      if (!filteredMessages?.length) continue;

      const texts = getTextFromMessages(filteredMessages);
      console.log({ texts });
      let newMessages;
      if (decryptMode) {
        newMessages = decryptTexts(texts, this.secretKey);
      } else {
        newMessages = encryptTexts(texts, this.secretKey, deleteMode);
      }
      await this.UpdateMessages(channelId, newMessages);
      if (deleteMode) this.DeleteMessages(channelId, newMessages);
    } while (messages?.length >= messageLimit);
  }

  async UpdateMessages(channelId, messages) {
    const messageIds = Object.keys(messages);
    const messageTexts = Object.values(messages);
    for (let i = 0; i < messageIds.length; i++) {
      const data = buildMessageContent(messageTexts[i]);
      await this.guildedFetcher.UpdateMessage(channelId, messageIds[i], data);
    }
  }

  async DeleteMessages(channelId, messages) {
    const messageIds = Object.keys(messages);
    for (let i = 0; i < messageIds.length; i++) {
      await this.guildedFetcher.DeleteMessage(channelId, messageIds[i]);
    }
  }
}

function filterMessages(userId, messages, includeEncryptedMessages = false) {
  const temp = messages.filter((message) => message.createdBy === userId);
  console.log(temp, includeEncryptedMessages, userId);
  if (includeEncryptedMessages) return temp;
  return temp.filter((message) => {
    const text = findTextInNodes(message.content.document.nodes);
    return text.indexOf(ivSearchStr) === -1;
  });
}

function getTextFromMessages(messages) {
  const texts = {};
  for (const message of messages) {
    texts[message.id] = findTextInNodes(message.content.document.nodes, '');
  }
  return texts;
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

function encryptTexts(texts, secretKey, deleteMode = false) {
  let encryptedTexts = {};
  Object.entries(texts).forEach(([messageId, text]) => {
    if (deleteMode) {
      encryptedTexts[messageId] = '[deleted for privacy]';
    } else {
      encryptedTexts[messageId] = encrypt(text, secretKey);
    }
  });
  return encryptedTexts;
}

function encrypt(text, secretKey) {
  const iv = crypto.randomBytes(16);
  console.log({ iv });
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return `${encrypted.toString('hex')}${ivSearchStr}${iv.toString('hex')}`;
}

function decryptTexts(texts, secretKey) {
  let decryptedTexts = {};
  Object.entries(texts).forEach((textObj) => {
    const messageId = textObj[0];
    const ivIndex = textObj[1].indexOf(ivSearchStr);
    const iv = Buffer.from(
      textObj[1].slice(ivIndex + 5, textObj[1].length),
      'hex',
    );
    const text = textObj[1].slice(0, ivIndex);

    decryptedTexts[messageId] = decrypt(text, secretKey, iv);
  });
  return decryptedTexts;
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
