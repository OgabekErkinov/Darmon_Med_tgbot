const moment = require("moment");
const { getVacancyKeyboard, getDefaultKeyboard, getMaritalStatusKeyboard, getCallbackKeyboard, getConfirmKeyboard } = require("./keyboards");
const { createSummary } = require("./summary");

const fields = (user, msg, bot) => {
  const chatId = msg.chat.id;

  if (!user || !user.step) return;

  switch (user.step) {
    case "name":
      if (!msg.text || msg.text.trim().length < 5) {
        bot.sendMessage(
          chatId,
          "❌ FIO juda qisqa yoki bo'sh. Iltimos, to‘liq ismingizni kiriting."
        );
        return;
      }
      user.name = msg.text.trim();
      user.step = "dob";
      bot.sendMessage(chatId, "📅 Tug‘ilgan sanangizni kiriting (DD/MM/YYYY):");
      return;

    case "dob":
      if (!msg.text) {
        bot.sendMessage(chatId, "❌ Iltimos sanani yozing (DD/MM/YYYY).");
        return;
      }
      const dob = moment(msg.text, "DD/MM/YYYY", true);
      if (!dob.isValid() || dob.isAfter(moment())) {
        bot.sendMessage(chatId, "❌ Sana noto‘g‘ri yoki kelajakdagi sana kiritildi.");
        return;
      }
      user.dob = dob.format("DD/MM/YYYY");
      user.step = "location";
      bot.sendMessage(chatId, "📍 Qayerda yashaysiz? (masalan: Qashqadaryo vil., Qarshi sh.):", getDefaultKeyboard());
      return;

    case "location":
      if (!msg.text) {
        bot.sendMessage(chatId, "❌ Iltimos, joylashuvni yozing.");
        return;
      }
      user.location = msg.text.trim();
      user.step = "status";
      bot.sendMessage(chatId, "💍 Oilaviy ahvolingizni tanlang:", getMaritalStatusKeyboard());
      return;

    case "status":
      if (!msg.text) {
        bot.sendMessage(chatId, "❌ Iltimos, oilaviy ahvolingizni tanlang.");
        return;
      }
      user.status = msg.text.trim();
      user.step = "education";
      bot.sendMessage(chatId, "🎓 Qayerda o‘qigansiz?", getDefaultKeyboard());
      return;

    case "education":
      if (!msg.text) {
        bot.sendMessage(chatId, "❌ Iltimos, o'qigan joyingizni yozing.");
        return;
      }
      user.education = msg.text.trim();
      user.step = "job";
      bot.sendMessage(chatId, "🏢 Qayerda ishlagansiz?");
      return;

    case "job":
      if (!msg.text) {
        bot.sendMessage(chatId, "❌ Iltimos, ish joyingizni yozing.");
        return;
      }
      user.job = msg.text.trim();
      user.step = "experience";
      bot.sendMessage(chatId, "🧠 Ish tajribangizni yozing (yil):");
      return;

    case "experience":
      if (!msg.text || !/^\d+$/.test(msg.text.trim())) {
        bot.sendMessage(chatId, "❌ Iltimos, faqat raqam kiriting. Masalan: 0 yoki 2");
        return;
      }
      user.experience = Number(msg.text.trim());
      user.step = "direction";
      bot.sendMessage(chatId, "🧭 Yo‘nalishingizni tanlang:", getVacancyKeyboard());
      return;

    case "direction":
      if (!msg.text) {
        bot.sendMessage(chatId, "❌ Iltimos, yo‘nalishni tanlang.", getVacancyKeyboard());
        return;
      }
      user.direction = msg.text.trim();
      user.step = "languages";
      bot.sendMessage(chatId, "🌐 Qaysi tillarni bilasiz? (masalan: o‘zbek, rus, ingliz)", getDefaultKeyboard());
      return;

    case "languages":
      if (!msg.text) {
        bot.sendMessage(chatId, "❌ Iltimos, tillarni yozing.");
        return;
      }
      user.languages = msg.text.trim();
      user.step = "phone";
      bot.sendMessage(chatId, "📞 Telefon raqamingizni yuboring:", {
        reply_markup: {
          keyboard: [[{ text: "📲 Telefon raqamni yuborish", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      return;

    case "phone":
      const raw = msg.contact?.phone_number || (msg.text && msg.text.trim());
      if (!raw) {
        bot.sendMessage(chatId, "❌ Iltimos, telefon raqam yuboring.");
        return;
      }
      const phone = raw.replace(/\s+/g, "");
      if (!/^\+?\d{9,15}$/.test(phone)) {
        bot.sendMessage(chatId, "❌ Telefon raqam noto‘g‘ri formatda. Masalan: +998901234567");
        return;
      }
      user.phone = phone;
      user.step = "photo";
      bot.sendMessage(chatId, "📷 Iltimos, rasmingizni yuboring:", getDefaultKeyboard());
      return;

    case "photo":
  if (!msg.photo || msg.photo.length === 0) {
    bot.sendMessage(chatId, "❌ Iltimos, rasm yuboring (📷).");
    return;
  }

  user.photo = msg.photo[msg.photo.length - 1].file_id;
  user.step = "done";

  // ✅ Rasm va inline tugmalar bilan yuborish
  bot.sendPhoto(chatId, user.photo, {
    caption: "📷 Rasm qabul qilindi!\n\n" + createSummary(user),
    parse_mode: "HTML",
    reply_markup: getConfirmKeyboard().reply_markup, // inline keyboard
  });
  return;}
};

module.exports = { fields };
