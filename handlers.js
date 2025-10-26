const { fields } = require("./fields");
const { getDefaultKeyboard, getConfirmKeyboard } = require("./keyboards");
const { createSummary } = require("./summary");

const adminChatId = Number(process.env.ADMIN_CHAT_ID);

const sendMessage = (msg, users, bot) => {
  const chatId = msg.chat.id;

  if (msg.text === "🔄 Restart") {
    if (chatId === adminChatId) return;
    users[chatId] = { step: "name" };
    bot.sendMessage(chatId, "🔁 Qaytadan boshladik. Ismingiz va familiyangizni kiriting.", getDefaultKeyboard());
    return;
  }

  if (!users[chatId] || msg.text?.startsWith("/")) return;
  
  const user = users[chatId];
  fields(user, msg, bot);
};

const askName = (msg, users, bot) => {
  const chatId = msg.chat.id;
  users[chatId] = { step: "name" };

  if (chatId !== adminChatId) {
    bot.sendMessage(chatId, "👋 Salom! Resume yaratish uchun ma'lumotlarni kiriting:");
    bot.sendMessage(chatId, "Ismingiz va familiyangizni kiriting:", getDefaultKeyboard());
  }
};

const sendPhoto = async (msg, users, bot) => {
  const chatId = msg.chat.id;
  const user = users[chatId];
  if (!user || user.step !== "photo") return;

  user.photo = msg.photo[msg.photo.length - 1].file_id;
  user.step = "done";

  const summary = createSummary(user);
  const photoId = user.photo;

  await bot.sendPhoto(chatId, photoId, { caption: summary, parse_mode: "HTML", reply_markup: getConfirmKeyboard().reply_markup });

};

const sendContact = (msg, users, bot) => {
  const chatId = msg.chat.id;
  const user = users[chatId];
  if (!user || user.step !== "phone") return;

  user.phone = msg.contact?.phone_number || user.phone;
  user.step = "photo";
  bot.sendMessage(chatId, "📷 Iltimos, rasmingizni yuboring:", getDefaultKeyboard());
};

const callBackQuery = async (query, users, bot) => {
  const chatId = query.message.chat.id;
  const user = users[chatId];
  if (!user) return;

  if (query.data === "confirm") {
     const summary = createSummary(user);
     const photoId = user.photo;
     
  // Adminga yuborish
     await bot.sendPhoto(adminChatId, photoId, { caption: summary, parse_mode: "HTML" });
  // User xabar yuborish
     await bot.sendMessage(chatId, "✅ Ma'lumotlar tasdiqlandi. Tez orada siz bilan bog'lanamiz!", getDefaultKeyboard());

  // User objectni o‘chirish
     delete users[chatId];
}

  if (query.data === "edit") {
    users[chatId] = { step: "name" };
    await bot.sendMessage(chatId, "✏️ Tahrirlash boshlandi. Iltimos, ismingizni kiriting.", getDefaultKeyboard());
  }

  bot.answerCallbackQuery(query.id);
};

module.exports = { sendMessage, askName, sendPhoto, sendContact, callBackQuery };
