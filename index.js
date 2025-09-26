const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const {
  askName,
  callBackQuery,
  sendPhoto,
  sendContact,
  sendMessage,
} = require('./handlers.js');

// Bot tokenini olish
const token = process.env.BOT_TOKEN;
const url = process.env.APP_URL;
const bot = new TelegramBot(token, { webHook: true });

// Railway webhook
bot.setWebHook(`${url}/bot${token}`);

const users = {};

// /start komandasi
bot.onText(/\/start/, (msg) => askName(msg, users, bot));

// Matnli xabarlar
bot.on('message', (msg) => sendMessage(msg, users, bot));

// Kontakt yuborish
bot.on('contact', (msg) => sendContact(msg, users, bot));

// Rasm yuborish
bot.on('photo', (msg) => sendPhoto(msg, users, bot));

// Inline tugmalar
bot.on('callback_query', (query) => callBackQuery(query, users, bot));

// Xatoliklar
bot.on('webhook_error', (err) => console.error('Webhook Error:', err.message));
