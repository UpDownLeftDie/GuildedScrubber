// USER INPUT
const channelId = '';
const decryptMode = false;
const deleteMode = false;

const secretKey = '';
const cookie = '';
const userId = '';
// CONSTS
const algorithm = 'aes-256-ctr';
const crypto = require('crypto');
const ivSearchStr = ' IV: ';

main();

async function main() {
  let messages = [];
  let beforeDate = null;
  const messageLimit = 100;
  do {
    messages = await getMessages(channelId, beforeDate, messageLimit);
    if (!messages) break;
    beforeDate = messages[messages.length - 1].createdAt;

    const filteredMessages = filterMessages(
      messages,
      decryptMode || deleteMode,
    );
    if (!filterMessages?.length) continue;

    const texts = getTextFromMessages(filteredMessages);
    console.log({ texts });
    let newMessages;
    if (decryptMode) {
      newMessages = decryptTexts(texts);
    } else {
      newMessages = encryptTexts(texts, deleteMode);
    }
    await updateMessages(channelId, newMessages);
    if (deleteMode) deleteMessages(channelId, newMessages);
  } while (messages?.length >= messageLimit);
}

async function getMessages(channelId, beforeDate, messageLimit) {
  const messagesUrl = new URL(
    `https://www.guilded.gg/api/channels/${channelId}/messages`,
  );
  messagesUrl.searchParams.append('limit', messageLimit);
  if (beforeDate) messagesUrl.searchParams.append('beforeDate', beforeDate);
  const res = await _fetchGuilded(messagesUrl.href);
  const messages = res.messages;
  console.log('getMessages', { messages });
  return messages;
}

async function updateMessages(channelId, messages) {
  const messageIds = Object.keys(messages);
  const messageTexts = Object.values(messages);
  for (let i = 0; i < messageIds.length; i++) {
    const data = _buildMessageContent(messageTexts[i]);
    await _updateMessage(channelId, messageIds[i], data);
  }
}

function _updateMessage(channelId, messageId, data) {
  const messageUrl = new URL(
    `https://www.guilded.gg/api/channels/${channelId}/messages/${messageId}`,
  );
  return _fetchGuilded(messageUrl, 'PUT', data);
}

function _buildMessageContent(contentText) {
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

async function deleteMessages(channelId, messages) {
  const messageIds = Object.keys(messages);
  for (let i = 0; i < messageIds.length; i++) {
    await _deleteMessage(channelId, messageIds[i]);
  }
}

function _deleteMessage(channelId, messageId) {
  const messageUrl = new URL(
    `https://www.guilded.gg/api/channels/${channelId}/messages/${messageId}`,
  );
  return _fetchGuilded(messageUrl, 'DELETE');
}

function filterMessages(messages, includeEncryptedMessages = false) {
  const temp = messages.filter((message) => message.createdBy === userId);
  if (includeEncryptedMessages) return temp;
  return temp.filter((message) => {
    const text = _findTextInNodes(message.content.document.nodes);
    return text.indexOf(ivSearchStr) === -1;
  });
}

async function _fetchGuilded(url, method = 'GET', data) {
  const res = await retryFetch(
    url,
    {
      method,
      headers: {
        authority: 'www.guilded.gg',
        accept: 'application/json, text/javascript, */*; q=0.01',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        cookie,
        pragma: 'no-cache',
      },
      body: JSON.stringify(data),
    },
    5,
  ).catch((err) => console.error(err));
  return res.json();
}

function encryptTexts(texts, deleteMode = false) {
  let encryptedTexts = {};
  Object.entries(texts).forEach(([messageid, text]) => {
    if (deleteMode) {
      encryptedTexts[messageid] = '[deleted for privacy]';
    } else {
      encryptedTexts[messageid] = encrypt(text);
    }
  });
  return encryptedTexts;
}

function decryptTexts(texts) {
  let decryptedTexts = {};
  Object.entries(texts).forEach((textObj) => {
    const messageId = textObj[0];
    const ivIndex = textObj[1].indexOf(ivSearchStr);
    const iv = Buffer.from(
      textObj[1].slice(ivIndex + 5, textObj[1].length),
      'hex',
    );
    const text = textObj[1].slice(0, ivIndex);

    decryptedTexts[messageId] = decrypt(text, iv);
  });
  return decryptedTexts;
}

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  console.log({ iv });
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return `${encrypted.toString('hex')}${ivSearchStr}${iv.toString('hex')}`;
};

const decrypt = (text, iv) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(text, 'hex')),
    decipher.final(),
  ]);

  return decrpyted.toString();
};

function _findTextInNodes(nodes, string, depth = 0) {
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
      const tempStr = _findTextInNodes(node.nodes, string, depth + 1);
      string = tempStr;
    }
  });
  return string.trim();
}

function getTextFromMessages(messages) {
  // const nodes = message.content.document.nodes
  const texts = {};
  for (message of messages) {
    texts[message.id] = _findTextInNodes(message.content.document.nodes, '');
  }
  return texts;
}

const delay = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms));

function retryFetch(
  url,
  fetchOptions = {},
  retries = 5,
  retryDelay = 1000,
  timeout,
) {
  return new Promise((resolve, reject) => {
    // check for timeout
    if (timeout) setTimeout(() => reject('error: timeout'), timeout);

    const wrapper = (n) => {
      fetch(url, fetchOptions)
        .then(async (res) => {
          const retryAfter = res.headers.get('Retry-After');

          if (res.status === 429 || retryAfter) {
            console.error('hit 429 or retryAfter: ', retryAfter || retryDelay);
            await delay(retryAfter || retryDelay);
            wrapper(--n);
          }

          resolve(res);
        })
        .catch(async (err) => {
          if (n > 0) {
            await delay(retryDelay);
            wrapper(--n);
          } else {
            reject(err);
          }
        });
    };

    wrapper(retries);
  });
}
