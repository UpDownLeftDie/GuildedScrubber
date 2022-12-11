// USER INPUT
const channelId = '888708e5-c551-433c-93a4-231cc07403f2';
const decryptMode = true;
const userId = 'Vmy2GNwA';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const cookie =
  'guilded_mid=25dfc6b311d00377d50a3cb52f3292eb; hmac_signed_session=d00ea31ad18e9f72ba7d3d0913c12e20f2762c5894f8ff023490ff07c45ec02c790de2f7e25e3cf88a39262dfe86.32a5272c63d18705fc26d068777429de.4cf8bdf196ef6a8fce2bf28896ccbb5c6fb1b701a3e0e58a27d850cb1dc71655; authenticated=true; __stripe_mid=00e3b9b3-6649-4f0d-9c60-7f91e45975a891f291; guilded_ipah=3b485c15be84ad3e2d22f4d1a8ee7c14; gk=can_edit_socket_permissions%2Cshow_new_bot_creator%2Cshow_activity_filter%2Cyt_allow_custom_name%2Cshow_bot_explore_native%2Cshow_bot_explore_web%2Cmeasure_memory%2Crelease_discover%2Cchat_message_context_menu%2Cnative_user_social_connections%2Cvirtualized_sidebar_members%2Cstreaming_pip%2Csocket_user_presence_v2%2Cnative_add_reply_on_chat_message_press%2Chide_message_embeds%2Cprofile_hover_card_v3%2Cpolls_v2%2Cin_app_update_banner_experiment%2Caggregate_event_calendar%2Cpartner_program_v2%2Cdeep_search%2Cshow_gradient_role_color_picker%2Cvideo_streaming_pip_view_enabled%2Cadd_external_bots%2Cexternal_bots%2Cstream_simulcast_disabled%2Cenable_rest_api_sockets%2Cbot_auth_tokens%2Cdeveloper_mode_v2%2Cshow_game_presence';
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

    const filteredMessages = filterMessages(messages, decryptMode);
    if (!filterMessages?.length) continue;

    const texts = getTextFromMessages(filteredMessages);
    console.log({ texts });
    let newMessages;
    if (decryptMode) {
      newMessages = decryptTexts(texts);
    } else {
      newMessages = encryptTexts(texts);
    }
    await updateMessages(channelId, newMessages);
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

function filterMessages(messages, decryptMode = false) {
  const temp = messages.filter((message) => message.createdBy === userId);
  if (decryptMode) return temp;
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

function encryptTexts(texts) {
  let encryptedTexts = {};
  Object.entries(texts).forEach(([messageid, text]) => {
    encryptedTexts[messageid] = encrypt(text);
  });
  return encryptedTexts;
}

function decryptTexts(texts) {
  let decryptedTexts = {};
  Object.entries(texts).forEach((textObj) => {
    const messageId = textObj[0];
    const ivIndex = textObj[1].indexOf(ivSearchStr);
    const iv = Buffer.from(
      textObj[1].slice(ivIndex + 5, textObj[1].length - 1),
      'hex',
    );
    const text = textObj[1].slice(0, ivIndex);

    decryptedTexts[messageId] = decrypt(text, iv);
  });
  return decryptedTexts;
}

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return `${encrypted.toString('hex')}${ivSearchStr}${iv.toString('hex')}}`;
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
