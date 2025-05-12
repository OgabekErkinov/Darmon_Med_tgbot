const createSummary = (user) => `
📝 <b>Resume:</b>

👤 Ism: ${user.name}
📅 Tug‘ilgan sana: ${user.dob}
📍 Joylashuv: ${user.location}
👨‍👩‍👧‍👦 Oilaviy ahvol: ${user.maritalStatus}
🎓 O‘qigan joyi: ${user.education}
🏭 Oxirgi ish joyi: ${user.job}
🧠 Tajriba: ${user.experience} yil
📚 Yo‘nalish: ${user.direction}
🌐 Tillar: ${user.language}
📞 Tel: ${user.phone}
🖼️ Rasm: yuborilgan rasm fayli
`;

module.exports = { createSummary };
