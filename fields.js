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
      user.step = 'location';
      bot.sendMessage(chatId, "📍 Qayerda yashaysiz? (masalan: Qashqadaryo viloyati, Qarshi shahri):");
      break;
    
      case 'location':
      user.location = msg.text;
      user.step = 'status';
      bot.sendMessage(chatId, "💍 Oilaviy ahvolingizni tanlang:", {
        reply_markup: {
          keyboard: [
            ["💑 Turmush qurganman", "🧍‍♂️ Turmush qurmaganman"]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      break;

      case 'status':
      user.status = msg.text;
      user.step = 'education';
      bot.sendMessage(chatId, "🎓 Qayerda o‘qigansiz?");
      break;

      case 'education' :
        user.education = msg.text;
        user.step = 'job';
        bot.sendMessage(chatId, "🏢 Qayerda ishlagansiz : ");
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
      user.step = 'direction';
      bot.sendMessage(chatId, "🧭 Yo‘nalishingizni tanlang:", {
        reply_markup: {
          keyboard: [
            ["👨‍⚕️ Shifokor", "💳 Kassir"],
            ["🧑‍⚕️ Hamshira", "🛡️ Oxrana"],
            ["🧼 Orastabon", "👨‍🍳 Oshpaz"],
            ["🏢 Qabul bo'limi", "📞 Call center"]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      break;

    case 'direction':
      user.direction = msg.text;
      user.step = 'languages';
      bot.sendMessage(chatId, "🌐 Qaysi tillarni bilasiz? (masalan: o‘zbek, rus, ingliz):");
      break;

    case 'languages':
      user.languages = msg.text;
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

            case 'phone':
      user.phone = msg.contact?.phone_number || msg.text;
      user.step = 'photo';
      bot.sendMessage(chatId, "📷 Iltimos, rasmingizni yuboring:");
      break;
  };

}

module.exports = { fields }