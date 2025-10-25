const getDefaultKeyboard = () => ({
  reply_markup: {
    keyboard: [[{ text: "🔄 Restart" }]],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
});

const getConfirmKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [{ text: "✅ Tasdiqlash", callback_data: "confirm" }],
      [{ text: "✏️ Tahrirlash", callback_data: "edit" }],
    ],
  },
});

const getVacancyKeyboard = () => ({
  reply_markup: {
    keyboard: [
      ["👨‍⚕️ Shifokor", "💳 Kassir"],
      ["🧑‍⚕️ Hamshira", "🛡️ Oxrana"],
      ["🧼 Orastabon", "👨‍🍳 Oshpaz"],
      ["🏢 Qabul bo'limi", "📞 Call center"],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
});

const getMaritalStatusKeyboard = () => ({
        reply_markup: {
          keyboard: [["💑 Turmush qurgan / Uylangan"],
                      ["🧍‍♂️ Turmush qurmagan / Uylanmagan"],
                      ["Ajrashgan"]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      })

const getCallbackKeyboard = () => ({
        reply_markup: {
          inline_keyboard: [
          [
            { text: "✅ Tasdiqlash", callback_data: "confirm" },
            { text: "✏️ Tahrirlash", callback_data: "edit" },
          ],
        ],
    },
  })

module.exports = {
  getDefaultKeyboard,
  getConfirmKeyboard,
  getVacancyKeyboard,
  getMaritalStatusKeyboard,
  getCallbackKeyboard
};
