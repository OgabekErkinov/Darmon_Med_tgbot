const getDefaultKeyboard = () => ({
  reply_markup: {
    keyboard: [[{ text: "🔄 Restart" }]],
    resize_keyboard: true,
    one_time_keyboard: false
  }
});

const getConfirmKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [{ text: "✅ Tasdiqlash", callback_data: "confirm" }],
      [{ text: "✏️ Tahrirlash", callback_data: "edit" }]
    ]
  }
});

module.exports = {
  getDefaultKeyboard,
  getConfirmKeyboard
};


