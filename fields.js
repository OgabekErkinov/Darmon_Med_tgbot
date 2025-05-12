const moment = require('moment');

const fields = (user, msg, bot) => {
    const chatId = msg.chat.id; 

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
}

module.exports = { fields }