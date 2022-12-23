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
    const beforeDateStr = beforeDate && beforeDate.toISOString();
    const afterDateStr = afterDate && afterDate.toISOString();
    for (const [i, channel] of channels.entries()) {
      setChannelsCount(i + 1);
      await this.ScrubChannel({
        userId,
        channelId: channel.id,
        channelType: channel.type,
        mode,
        passphrase,
        beforeDate: beforeDateStr,
        afterDate: afterDateStr,
        setAction,
      });
    }
    setAction('DONE!');
  }

  static async ScrubChannel({
    userId,
    channelId,
    channelType,
    mode,
    passphrase,
    beforeDate,
    afterDate,
    setAction,
  }) {
    const messageLimit = 100;

    let totalMessageCount = 0;
    const deleteMode = mode === this.MODES.DELETE;
    const decryptMode = mode === this.MODES.DECRYPT;

    if (CHAT_CHANNELS.includes(channelType)) {
      totalMessageCount += await GuildedScrubber.HandleChatChannel({
        userId,
        channelId,
        beforeDate,
        afterDate,
        passphrase,
        setAction,
        deleteMode,
        decryptMode,
        messageLimit,
      });
    }
  }

  static async HandleChatChannel({
    userId,
    channelId,
    beforeDate,
    afterDate,
    passphrase,
    setAction,
    deleteMode,
    decryptMode,
    messageLimit,
  }) {
    let messages = [];
    let messageCount = 0;
    do {
      setAction('Loading chat messages');
      const messages = await GuildedScrubber.FetchApi({
        route: `channel/${channelId}/messages`,
        headers: {
          ...(beforeDate && { 'before-date': beforeDate }),
          ...(afterDate && { 'after-date': afterDate }),
          ...(messageLimit && { 'message-limit': messageLimit }),
        },
      });
      if (!messages?.length) break;
      beforeDate = messages[messages.length - 1].createdAt;
      console.log({ messages });

      const filteredMessages = filterMessages(
        userId,
        messages,
        decryptMode,
        deleteMode,
      );
      if (!filteredMessages?.length) continue;
      messageCount += filteredMessages.length;

      let newMessages;
      const texts = getTextFromMessages(filteredMessages);
      if (decryptMode) {
        setAction('Decrypting messages');
        newMessages = decryptTexts(texts, passphrase);
      } else {
        setAction(
          deleteMode ? 'Prepping message for delete' : 'Encrypting messages',
        );
        newMessages = encryptTexts(texts, passphrase, deleteMode);
      }

      await GuildedScrubber.UpdateMessages(channelId, newMessages);
      if (deleteMode) {
        setAction('Deleting messages');
        await GuildedScrubber.DeleteMessages(channelId, newMessages);
      }
    } while (messages?.length >= messageLimit);
    return messageCount;
  }

  static async UpdateMessages(channelId, messages) {
    for (const [messageId, data] of Object.entries(messages)) {
      const result = await GuildedScrubber.FetchApi({
        route: `channel/${channelId}/message/${messageId}`,
        method: 'PUT',
        data,
      });
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

function filterMessages(userId, messages, decryptMode, deleteMode) {
  return messages.filter((message) => {
    if (message.createdBy !== userId) return false; //  cant act on other's messages
    if (deleteMode) return true; // we're deleting messages so don't care if they're encrypted or not

    // if we're encrypting messages
    if (!decryptMode) {
      const text = findTextInNodes(message.content.document.nodes);
      return !text.includes(ivSearchStr); // don't include messages that are already encrypted
    }
    return true;
  });
}

function getTextFromMessages(messages) {
  const texts = {};
  for (const message of messages) {
    texts[message.id] = {
      text: findTextInNodes(message.content.document.nodes, ''),
      channelId: message.channelId,
    };
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
  Object.entries(texts).forEach(([messageId, messageInfo]) => {
    const text = deleteMode
      ? '[deleted for privacy]'
      : encrypt(messageInfo.text, secretKey);

    encryptedTexts[messageId] = buildMessageContent(text);
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
