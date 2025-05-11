const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
require('dotenv').config();
const { getDefaultKeyboard, getConfirmKeyboard } = require('./keyboards.js');

const token = process.env.BOT_TOKEN
const bot = new TelegramBot(token, { polling: true });

const users = {};

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  users[chatId] = { step: 'name' };

  bot.sendMessage(chatId, "👋 Salom! Resume yaratish uchun quyidagi ma'lumotlarni kiriting:");
  bot.sendMessage(chatId, "Ismingiz va familiyangizni kiriting:", getDefaultKeyboard());
});

// Matnli xabarlar
bot.on('message', (msg) => {
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

  switch (user.step) {
    case 'name':
      if (msg.text.length < 5) {
        bot.sendMessage(chatId, "❌ FIO juda ham qisqa. Iltimos, to‘liq ismingizni va familiyangizni kiriting.");
        return;
      }
      user.name = msg.text;
      user.step = 'location';
      bot.sendMessage(chatId, "📍 Qayerda yashaysiz? (masalan: Qashqadaryo viloyati, Qarshi shahri):");
      break;

    case 'location':
      user.location = msg.text;
      user.step = 'dob';
      bot.sendMessage(chatId, "📅 Tug‘ilgan sanangizni kiriting (masalan, 01/01/2000):");
      break;

    case 'dob':
      const dob = moment(msg.text, "DD/MM/YYYY", true);
      if (!dob.isValid()) {
        bot.sendMessage(chatId, "❌ Sana noto‘g‘ri formatda kiritildi. Masalan: 01/01/2000");
        return;
      }
      user.dob = dob.format("DD/MM/YYYY");
      user.step = 'job';
      bot.sendMessage(chatId, "🏢 Hozirgi ish joyingizni kiriting (Talaba, haydovchi yoki boshqa):");
      break;

    case 'job':
      user.job = msg.text;
      user.step = 'experience';
      bot.sendMessage(chatId, "🧠 Ish tajribangizni yozing (yil):");
      break;

    case 'experience':
      if (!/^\d+$/.test(msg.text)) {
        bot.sendMessage(chatId, "❌ Iltimos, faqat raqam kiriting. Masalan: 0 yoki 2");
        return;
      }
      user.experience = msg.text;
      user.step = 'education';
      bot.sendMessage(chatId, "🎓 Ma'lumotingizni tanlang:", {
        reply_markup: {
          keyboard: [
            ["🎓 Oliy"],
            ["🏫 O‘rta maxsus", "🏠 Umumiy o‘rta"]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      break;

    case 'education':
      user.education = msg.text;
      user.step = 'workNight';
      bot.sendMessage(chatId, "🌙 Kechki payt ishlay olasizmi?", {
        reply_markup: {
          keyboard: [
            ["Ha", "Yo'q"]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      break;

    case 'workNight':
      user.workNight = msg.text;
      user.step = 'phone';
      bot.sendMessage(chatId, "📞 Telefon raqamingizni yuboring:", {
        reply_markup: {
          keyboard: [[{
            text: "📲 Telefon raqamni yuborish",
            request_contact: true
          }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      break;
  }
});

// Kontakt yuborish
bot.on('contact', (msg) => {
  const chatId = msg.chat.id;
  const user = users[chatId];

  if (!user || user.step !== 'phone') return;

  user.phone = msg.contact.phone_number;
  user.step = 'photo';
  bot.sendMessage(chatId, "📷 Iltimos, rasmingizni yuboring (galereyadan):", getDefaultKeyboard());
});

// Rasm yuborish
bot.on('photo', async (msg) => {
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

  const summary = `📝 <b>Resume:</b>\n\n👤 Ism: ${user.name}\n📍 Joylashuv: ${user.location}\n📅 Tug‘ilgan sana: ${user.dob}\n🏢 Ish joyi: ${user.job}\n🧠 Tajriba: ${user.experience} yil\n🎓 Ma’lumot: ${user.education}\n🌙 Kechki ish: ${user.workNight}\n📞 Tel: ${user.phone}`;

  const adminChatId = Number(process.env.ADMIN_CHAT_ID);
  await bot.sendPhoto(adminChatId, photo.file_id, {
    caption: summary,
    parse_mode: "HTML"
  });

  bot.sendMessage(chatId, "✅ Ma'lumotlaringiz yuborildi. Tez orada siz bilan bog'lanamiz!");
});

// Inline tugmalar
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const user = users[chatId];
  if (!user) return;

  if (data === 'confirm') {
    bot.sendMessage(chatId, "✅ Ma'lumotlar tasdiqlandi. Rahmat!", getDefaultKeyboard());
    delete users[chatId];
  }

  if (data === 'edit') {
    users[chatId].step = 'name';
    bot.sendMessage(chatId, "✏️ Tahrirlash boshlandi. Iltimos, ismingizni qaytadan kiriting.", getDefaultKeyboard());
  }

  bot.answerCallbackQuery(query.id);
});

// Xatoliklar
bot.on("polling_error", (err) => console.error("Polling Error:", err));
