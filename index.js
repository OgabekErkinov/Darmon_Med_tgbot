const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const {
  askName,
  callBackQuery,
  sendPhoto,
  sendContact,
  sendMessage,
} = require('./handlers.js');

// Bot tokeni va URL
const token = process.env.BOT_TOKEN;
const url = process.env.APP_URL;
const port = process.env.PORT || 3000;

// Botni webhook rejimida ishga tushiramiz
const bot = new TelegramBot(token, { webHook: true });
bot.setWebHook(`${url}/bot${token}`);

// Express server
const app = express();
app.use(express.json());

// Telegram webhook endpoint
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

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
bot.on('webhook_error', (err) =>
  console.error('Webhook Error:', err.message)
);

// Serverni ishga tushirish
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
