const User = require("../models/userModel");
const bcrypt = require('bcrypt');



exports.getAllUsers = async (req, res) => {
      const user = await User.find().select("-password").lean();
      if(!user.length){
        return res.status(400).json({masage:"No Users fond"})
      }
      res.json(user);
};

exports.getUsers = async (req, res) => {
  const userId = req.user; 
  
  const user = await User.findById(userId).select("-password");
  if (!user) { 
    return res.status(400).json({ message: "No Users found" }); 
  }
  
  res.json(user);
};

exports.getNurses = async (req, res) => {

  
  const nurses = await User.find({role:"nurse"}).select("-password").lean();
  if (!nurses.length) { 
    return res.status(400).json({ message: "No nurses found" }); 
  }
  
  res.json(nurses);
};

exports.getUsersById = async (req, res) => {
  try {
    const useridfromToken = req.user; 
    const { id } = req.params;

    // التحقق من وجود useridfromToken أولاً
    if (!useridfromToken) {
      return res.status(401).json({ message: "غير مصرح: توكن غير صالح" });
    }

    // التحقق من الصلاحيات
    if (useridfromToken !== id && req.userRole !== "admin") {
      return res.status(403).json({ message: "غير مصرح لك بالوصول لهذه الصفحة" });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "لم يتم العثور على المستخدم" }); 
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ في الخادم", error: err.message });
  }
};

exports.updateUsersById = async (req, res) => {
  try {
    const userIdFromToken = String(req.user);
    const { id } = req.params;
    const updates = req.body;

    if (req.userRole !== "admin") {
      if ("role" in updates) {
        return res.status(403).json({ message: "غير مصرح لك بتعديل الدور" });
      }
      if (userIdFromToken !== id) {
        return res.status(403).json({ message: "غير مسموح لك بتعديل بيانات هذا المستخدم" });
      }
    }

    const forbiddenUpdates = ['password', 'email', 'nationalID'];
    forbiddenUpdates.forEach(field => {
      if (field in updates) {
        delete updates[field];
      }
    });

    const updateUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).select("-password");

    if (!updateUser) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.json(updateUser);
  } catch (err) {
    res.status(500).json({
      message: "حدث خطأ أثناء تحديث البيانات",
      error: err.message
    });
  }
};

exports.updatepassById = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const userIdFromToken = req.user;

    // 1. التحقق من أن المستخدم يعدل كلمة مروره فقط
    if (userIdFromToken !== id) {
      return res.status(403).json({ message: "غير مسموح لك بتعديل كلمة مرور مستخدم آخر" });
    }

    // 2. التحقق من وجود جميع الحقول المطلوبة
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "يجب إدخال كلمة المرور الحالية والجديدة" });
    }

    // 3. البحث عن المستخدم
    const user = await User.findById(id).select('+password');
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // 4. التحقق من صحة كلمة المرور الحالية
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة" });
    }

    // 5. التحقق من قوة كلمة المرور الجديدة
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "كلمة المرور الجديدة يجب أن تحتوي على الأقل على: 8 أحرف، حرف كبير، حرف صغير، رقم، ورمز خاص"
      });
    }

    // 6. تشفير وحفظ كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    // 7. إرسال رسالة نجاح
    res.json({ message: "تم تحديث كلمة المرور بنجاح" });

  } catch (err) {
    res.status(500).json({ 
      message: "حدث خطأ أثناء تحديث كلمة المرور",
      error: err.message 
    });
  }
};

exports.updateemailById = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newEmail } = req.body;
    const userIdFromToken = req.user;

    // 1. التحقق من الصلاحيات
    if (userIdFromToken !== id) {
      return res.status(403).json({ message: "غير مسموح لك بتعديل بريد مستخدم آخر" });
    }

    // 2. التحقق من الحقول المطلوبة
    if (!currentPassword || !newEmail) {
      return res.status(400).json({ message: "يجب إدخال كلمة المرور الحالية والبريد الجديد" });
    }

    // 3. البحث عن المستخدم
    const user = await User.findById(id).select('+password');
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // 4. التحقق من كلمة المرور الحالية
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة" });
    }

    // 5. التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ message: "صيغة البريد الإلكتروني غير صالحة" });
    }

    // 6. التحقق من عدم تكرار البريد
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(409).json({ message: "البريد الإلكتروني مسجل بالفعل" });
    }

    // 7. تحديث البريد الإلكتروني
    user.email = newEmail;
    await user.save();

    res.json({ message: "تم تحديث البريد الإلكتروني بنجاح" });

  } catch (err) {
    res.status(500).json({ 
      message: "حدث خطأ أثناء تحديث البريد الإلكتروني",
      error: err.message 
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user;
    const requestingUserRole = req.userRole;

    // 1. لا يسمح للمستخدم بحذف نفسه
    if (requestingUserId === id) {
      return res.status(403).json({ 
        message: "لا يمكنك حذف حسابك الشخصي. يرجى التواصل مع المسؤول" 
      });
    }

    // 2. البحث عن المستخدم المراد حذفه
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // 3. التحقق من الصلاحيات (يجب أن يكون المسؤول هو الوحيد القادر على الحذف)
    // Note: يتم التحقق تلقائياً بواسطة middleware IsAdmin قبل الوصول لهذا الكود

    // 4. تنفيذ الحذف
    await User.findByIdAndDelete(id);

    // 5. إرسال تأكيد الحذف (بدون بيانات حساسة)
    res.json({ 
      message: "تم حذف المستخدم بنجاح",
      deletedUserId: id,
      deletedUserEmail: userToDelete.email // اختياري - يمكن إزالته إذا كان حساساً
    });

  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ 
      message: "حدث خطأ أثناء حذف المستخدم",
      error: err.message 
    });
  }
};
