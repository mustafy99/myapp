const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const User = require("./models/userModel");


const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const users = {};

// 🧠 دالة تحقق من صيغة الإيميل
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}



async function handleUserData(user) {
    try {
      user.email = user.email.trim().toLowerCase();
      console.log('📨 المستخدم أدخل الإيميل:', user.email);
  
      const foundUser = await User.findOne({ email: user.email }).exec();
  
      if (foundUser) {
        if (foundUser.role === 'admin' || foundUser.role === 'SuberVisor') {
          // حفظ Telegram ID
          foundUser.telegramId = user.chatId;
          await foundUser.save();
  
          bot.sendMessage(user.chatId, '✅ تم الاشتراك في خدمة الإشعارات اللحظية بنجاح!');
          console.log(`✅ محفوظ ID: ${foundUser.telegramId}`);
        } else {
          bot.sendMessage(user.chatId, '🚫 عذراً، هذه الخدمة مخصصة للمشرفين فقط.\nللتواصل مع الإدارة: 📞 01550168225');
        }
      } else {
        bot.sendMessage(user.chatId, '🚫 لم يتم العثور على حسابك في قاعدة البيانات. تواصل مع الدعم: 📞 01550168225');
      }
    } catch (err) {
      console.error('❌ خطأ أثناء التحقق من بيانات المستخدم:', err);
      bot.sendMessage(user.chatId, '⚠️ حصل خطأ غير متوقع، حاول لاحقاً.');
    }
  }
  


bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'أنا جاهز ✅', callback_data: 'ready' }]
      ]
    }
  };

  bot.sendMessage(chatId, 'أهلاً بك في البوت! اضغط "أنا جاهز ✅" للمتابعة 🎯', options);
});

bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data === 'ready') {
    users[chatId] = { step: 'waiting_for_email', chatId };
    bot.sendMessage(chatId, 'من فضلك أدخل بريدك الإلكتروني ✉️');
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith('/')) return;

  if (users[chatId] && users[chatId].step === 'waiting_for_email') {
    if (!isValidEmail(text)) {
      bot.sendMessage(chatId, '❌ البريد الإلكتروني غير صحيح.\nرجاءً تأكد من كتابته بشكل صحيح مثل: example@email.com');
      return;
    }

    users[chatId].email = text;
    users[chatId].step = 'done';

    bot.sendMessage(chatId, `تم تسجيل بريدك الإلكتروني بنجاح ✅\n📧: ${text}`);

    // تشغيل دالة بعد التسجيل
    handleUserData(users[chatId]);

  } else {
    bot.sendMessage(chatId, 'من فضلك اضغط /start وابدأ أولاً بالضغط على "أنا جاهز ✅" 👇');
  }
});

module.exports = bot;
