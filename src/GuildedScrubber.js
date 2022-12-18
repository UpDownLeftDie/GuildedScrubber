import Cookies from 'js-cookie';
import crypto from 'crypto';
import fetch from 'node-fetch';
const algorithm = 'aes-256-ctr';
const ivSearchStr = ' IV: ';

const CHANNEL_TYPES = {
  ANNOUNCEMENT: 'announcement',
  CHAT: 'chat',
  DOC: 'doc',
  EVENT: 'event',
  FORUM: 'forum',
  LIST: 'list',
  MEDIA: 'media',
  STREAM: 'stream',
  VOICE: 'voice',
};

const CHAT_CHANNELS = [
  CHANNEL_TYPES.CHAT,
  CHANNEL_TYPES.STREAM,
  CHANNEL_TYPES.VOICE,
];

export default class GuildedScrubber {
  static MODES = {
    ENCRYPT: 'encrypt',
    DECRYPT: 'decrypt',
    DELETE: 'delete',
  };
  static async FetchApi({ route, method = 'GET', headers, data }) {
    const hmac = Cookies.get('guilded-hmac');
    console.log({ data, ...(data ? { body: JSON.stringify(data) } : {}) });
    return fetch(`/api/${route}`, {
      method,
      headers: {
        ...headers,
        hmac,
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    }).then((res) => {
      if (res.ok) {
        try {
          return res.json();
        } catch (error) {
          return res.text();
        }
      }
    });
  }

  static async GetUser() {
    return await GuildedScrubber.FetchApi({ route: 'user' });
  }

  static async GetAllTeams(teamIds, shouldFetchDMs = false) {
    let teams = JSON.parse(localStorage.getItem('teams') || '{}');

    for (const teamId of teamIds) {
      if (teams[teamId]?.channels?.length > 0) continue;
      const team = await GuildedScrubber.FetchApi({ route: `team/${teamId}` });
      teams[teamId] = team;

      localStorage.setItem('teams', JSON.stringify(teams));
    }
    teams = JSON.parse(localStorage.getItem('teams'));

    const filteredTeams = Object.fromEntries(
      Object.entries(teams).filter(([teamId]) => {
        return teamIds.includes(teamId);
      }),
    );

    return filteredTeams;
  }

  static async ScrubChannels(
    userId,
    channels,
    mode,
    passphrase,
    beforeDate,
    afterDate,
    setChannelsCount,
    setAction,
  ) {
    const beforeDateStr =
      beforeDate && encodeURIComponent(beforeDate.toISOString());
    const afterDateStr =
      afterDate && encodeURIComponent(afterDate.toISOString());
    for (const [i, channel] of channels.entries()) {
      console.log({ i, channelId: channel.id });
      setChannelsCount(i + 1);
      await this.ScrubChannel({
        userId,
        channelId: channel.id,
        mode,
        passphrase,
        beforeDate: beforeDateStr,
        afterDate: afterDateStr,
        setAction,
      });
    }
  }

  static async ScrubChannel({
    userId,
    channelId,
    mode,
    passphrase,
    beforeDate,
    afterDate,
    setAction,
  }) {
    const messageLimit = 2;
    let messages = [];
    let totalMessageCount = 0;
    const deleteMode = mode === this.MODES.DELETE;
    const decryptMode = mode === this.MODES.DECRYPT;
    do {
      setAction('Loading messages');
      console.log('Loading messages', { channelId });
      messages = await GuildedScrubber.FetchApi({
        route: `channel/${channelId}/messages`,
        headers: {
          ...(beforeDate && { 'before-date': beforeDate }),
          ...(afterDate && { 'after-date': afterDate }),
          ...(messageLimit && { 'message-limit': messageLimit }),
        },
      });
      if (!messages?.length) break;
      beforeDate = messages[messages.length - 1].createdAt;

      const filteredMessages = filterMessages(
        userId,
        messages,
        decryptMode || deleteMode,
      );
      if (!filteredMessages?.length) continue;
      totalMessageCount += filteredMessages.length;

      const texts = getTextFromMessages(filteredMessages);
      let newMessages;
      if (decryptMode) {
        setAction('Decrypting messages');
        newMessages = decryptTexts(texts, passphrase);
      } else {
        setAction(
          deleteMode ? 'Prepping message for delete' : 'Encrypting messages',
        );
        newMessages = encryptTexts(texts, passphrase);
      }

      await GuildedScrubber.UpdateMessages(channelId, newMessages);
      if (deleteMode) {
        setAction('Deleting messages');
        await GuildedScrubber.DeleteMessages(channelId, newMessages);
      }
    } while (messages?.length >= messageLimit);
  }

  static async UpdateMessages(channelId, messages) {
    const messageIds = Object.keys(messages);
    const messageTexts = Object.values(messages);
    for (let i = 0; i < messageIds.length; i++) {
      const data = buildMessageContent(messageTexts[i]);
      const test = await GuildedScrubber.FetchApi({
        route: `channel/${channelId}/message/${messageIds[i]}`,
        method: 'PUT',
        data,
      });
      console.log('adslkjsdlfkasdlkfhasjkfhds', { test, channelId, i });
    }
  }

  static async DeleteMessages(channelId, messages) {
    const messageIds = Object.keys(messages);
    for (let i = 0; i < messageIds.length; i++) {
      return await GuildedScrubber.FetchApi({
        route: `channel/${channelId}/message/${messageIds[i]}`,
        method: 'DELETE',
      });
    }
  }
}

function filterMessages(userId, messages, includeEncryptedMessages = false) {
  const temp = messages.filter((message) => message.createdBy === userId);
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
