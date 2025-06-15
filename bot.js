const User = require("./models/userModel"); // عدّل المسار حسب مكان الملف
const bot = require('./telegramBot'); // البوت بتاعك (الموديل اللي صدرته بـ module.exports)

async function notifyAllUsers(message) {
  try {
    const usersWithTelegram = await User.find({
      telegramId: { $exists: true, $ne: null },
      role: { $in: ['admin'] }
    });
    

    for (const user of usersWithTelegram) {
      try {
        await bot.sendMessage(user.telegramId, message);
      } catch (err) {
        console.error(`❌ فشل في إرسال الرسالة للمستخدم ${user.email} (${user.telegramId}):`, err.message);
      }
    }

    console.log(`✅ تم إرسال الرسالة إلى ${usersWithTelegram.length} مستخدم`);
  } catch (err) {
    console.error('❌ خطأ أثناء محاولة إرسال الرسائل:', err);
  }
}

module.exports = notifyAllUsers;
