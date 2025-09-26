const createSummary = (user) => `
📝 <b>Resume:</b>

👤 Ism: ${user.name}
📅 Tug‘ilgan sana: ${user.dob}
📍 Joylashuv: ${user.location}
👨‍👩‍👧‍👦 Oilaviy ahvol: ${user.status}
🎓 O‘qigan joyi: ${user.education}
🏢 Oxirgi ish joyi: ${user.job}
🧠 Tajriba: ${user.experience} yil
🧭 Yo‘nalish: ${user.direction}
🌐 Tillar: ${user.languages}
📞 Tel: ${user.phone}
`;

module.exports = { createSummary };
