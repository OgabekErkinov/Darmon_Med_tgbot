const { fields } = require('./fields');
const { getDefaultKeyboard } = require('./keyboards')

const sendMessage = async (msg, users, bot) => {
  const chatId = msg.chat.id;

  // Admin uchun restartni bloklash
  if (msg.text === "🔄 Restart") {
    if (chatId === Number(process.env.ADMIN_CHAT_ID)) return;
    users[chatId] = { step: 'name' };
    bot.sendMessage(chatId, "🔁 Qaytadan boshladik. Ismingiz va familiyangizni kiriting.", getDefaultKeyboard());
    return;
  }

  // Buyruq / foydalanuvchi hali boshlamagan bo‘lsa
  if (!users[chatId] || msg.text?.startsWith("/")) return;
  const user = users[chatId];

  fields(user, msg, bot)

}
const askName = async (msg, users, bot) => {
  const chatId = msg.chat.id;
  users[chatId] = { step: 'name' };

  bot.sendMessage(chatId, "👋 Salom! Resume yaratish uchun quyidagi ma'lumotlarni kiriting:");
  bot.sendMessage(chatId, "Ismingiz va familiyangizni kiriting:", getDefaultKeyboard());
}

const sendPhoto = async (msg, users, bot) => {
  const chatId = msg.chat.id;
  const user = users[chatId];
  if (!user || user.step !== 'photo') return;

  const photo = msg.photo[msg.photo.length - 1];
  const file = await bot.getFile(photo.file_id);
  const fileExtension = file.file_path.split('.').pop().toLowerCase();

  if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
    bot.sendMessage(chatId, "❌ Faqat JPG, PNG yoki GIF formatidagi rasm yuboring.");
    return;
  }

  user.photo = photo.file_id;
  user.step = 'done';

const summary = `📝 <b>Resume:</b>\n
👤 Ism: ${user.name}
📍 Joylashuv: ${user.location}
📅 Tug‘ilgan sana: ${user.dob}
👨‍👩‍👧‍👦 Oilaviy ahvol: ${user.familyStatus}
🎓 O‘qigan joyi: ${user.studyPlace}
🏢 Ish joyi (hozirgi): ${user.job}
🏭 Ilgari ishlagan joy: ${user.lastJobPlace}
📚 Yo‘nalish: ${user.direction}
🧠 Tajriba: ${user.experience} yil
🎓 Ma’lumot: ${user.education}
🌙 Kechki ish: ${user.workNight}
📞 Tel: ${user.phone}`;

  const adminChatId = Number(process.env.ADMIN_CHAT_ID);
  await bot.sendPhoto(adminChatId, photo.file_id, {
    caption: summary,
    parse_mode: "HTML"
  });

  await bot.sendPhoto(chatId, photo.file_id, {
    caption: summary,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Tasdiqlash", callback_data: "confirm" },
          { text: "✏️ Tahrirlash", callback_data: "edit" }
        ]
      ]
    }})
 
}

sendContact = async (msg, users, bot) => {
  const chatId = msg.chat.id;
  const user = users[chatId];

  if (!user || user.step !== 'phone') return;

  user.phone = msg.contact.phone_number;
  user.step = 'photo';
  bot.sendMessage(chatId, "📷 Iltimos, rasmingizni yuboring (galereyadan):", getDefaultKeyboard());
}

const callBackQuery = async (query, users, bot) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const user = users[chatId];
  if (!user) return;

  if (data === 'confirm' && user.step === 'done') {
    bot.sendMessage(chatId, "✅ Ma'lumotlar tasdiqlandi. Rahmat!", getDefaultKeyboard());
    delete users[chatId];
  }

  if (data === 'edit') {
    users[chatId].step = 'name';
    bot.sendMessage(chatId, "✏️ Tahrirlash boshlandi. Iltimos, ismingizni qaytadan kiriting.", getDefaultKeyboard());
  }

  bot.answerCallbackQuery(query.id);
}



module.exports = { sendMessage, askName, sendPhoto, sendContact, callBackQuery }