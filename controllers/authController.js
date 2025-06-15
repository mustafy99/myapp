const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const notifyAllUsers = require('../bot');

dotenv.config();

// ─── تسجيل مستخدم جديد ───────────────────────────────────
exports.register = async (req, res) => {
    const { fullName, email, password, nationalID,age, phone, role } = req.body;

    // ✅ التحقق من الحقول المطلوبة
    const requiredFields = ['fullName', 'email', 'password', "nationalID", "phone"];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({ 
            message: `❌ الحقول التالية مطلوبة: ${missingFields.join(', ')}`
        });
    }

    // التحقق من الرقم القومي
    const nationalIDRegex = /^\d{14}$/;
    if (!nationalIDRegex.test(nationalID)) {
        return res.status(400).json({
            message: "❌ الرقم القومي يجب أن يكون 14 رقمًا فقط دون أحرف"
        });
    }

    // التحقق من رقم الهاتف
    const phoneRegex = /^01\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            message: "❌ رقم الهاتف يجب أن يبدأ بـ 01 ويتكون من 11 رقماً"
        });
    }

    // التحقق من عدم تكرار البريد الإلكتروني أو الرقم القومي
    const foundUser = await User.findOne({ 
        $or: [{ email }, { nationalID }] 
    }).exec();

    if (foundUser) {
        const duplicateField = foundUser.email === email ? 'البريد الإلكتروني' : 'الرقم القومي';
        return res.status(409).json({ 
            message: `❌ ${duplicateField} مسجل مسبقًا` 
        });
    }

    // التحقق من قوة الباسورد
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
    if (!strongPasswordRegex.test(password)) {
        return res.status(400).json({
            message: "🔐 الباسورد لازم يحتوي على حرف كبير، صغير، رقم، ورمز خاص!"
        });
    }

    try {
        const hashpassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            full_name: fullName,
            email,
            password: hashpassword,
            nationalID,
            phone,
            age,
            role
        });

        const accessToken = jwt.sign({
            UserInfo: {
                id: user._id,
                name: user.full_name,
                role: user.role
            }
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        const refreshToken = jwt.sign({
            UserInfo: {
                id: user._id,
                name: user.full_name,
                role: user.role
            }
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 1000 * 60 * 60 * 24 * 7
        });        const userInfo = {
            name: user.full_name,
            age: user.age,
            phone: user.phone,
            role: user.role,
            registeredAt: new Date().toLocaleString('ar-EG', { hour12: true }) // التاريخ والوقت بالعربي (مصر)
             };

const message = `
━━━━━━━━━━━━━━━━━━
✅ تم تسجيل حساب جديد
━━━━━━━━━━━━━━━━━━

👤 الاسم: ${userInfo.name}
🎂 العمر: ${userInfo.age}
📞 الهاتف: ${userInfo.phone}
🛡️ الدور: ${userInfo.role}
📅 تاريخ التسجيل: ${userInfo.registeredAt}

━━━━━━━━━━━━━━━━━━
`;


notifyAllUsers(message);



        res.json({ 
            fullName: user.full_name,
            email: user.email,
            role: user.role,
            nationalID: user.nationalID,
            phone: user.phone,
            accessToken 
        });

    } catch (err) {
        res.status(500).json({ 
            message: "❌ حدث خطأ أثناء إنشاء الحساب",
            error: err.message 
        });
    }
};



exports.login = async (req, res) => {

    const { fullName, email,  password } = req.body;

    // ✅ التحقق من الحقول المطلوبة (بدون birthDate و nationalID)
    const requiredFields = [ 'email', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);


    if (missingFields.length > 0) {
        return res.status(400).json({ 
            message: `❌ الحقول التالية مطلوبة: ${missingFields.join(', ')}`
        });
    }


        const foundUser = await User.findOne({email}).exec();

        if(!foundUser){
            return res.status(401).json({ message:"User does esist"});
        }

            const matchpassword = await bcrypt.compare(password,foundUser.password)
         if(!matchpassword)return res.status(401).json({message:"The email or password you entered is incorrect"})



            const accessToken = jwt.sign({
                UserInfo:{
                    id:foundUser._id,
                    name:foundUser.full_name,
                    role:foundUser.role
                }
            },process.env.ACCESS_TOKEN_SECRET,{expiresIn:'15m'})


            const refreshToken = jwt.sign({
                UserInfo:{
                    id:foundUser._id,
                    name:foundUser.full_name,
                    role:foundUser.role
                }
            },process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"});

            res.cookie("jwt",refreshToken,{
                httpOnly:true,
                secure:true,
                sameSite:"None",
                maxAge:1000*60*60*24*7
            })



             const userInfo = {
              name:foundUser.full_name,
              age:foundUser.age,
              phone: foundUser.phone,
              role: foundUser.role,
              registeredAt: new Date().toLocaleString('ar-EG', { hour12: true }) // التاريخ والوقت بالعربي (مصر)
               };

const message = `
━━━━━━━━━━━━━━━━━━
🔐 تم تسجيل دخول جديد
━━━━━━━━━━━━━━━━━━

👤 الاسم: ${userInfo.name}
🎂 العمر: ${userInfo.age}
📞 الهاتف: ${userInfo.phone}
🛡️ الدور: ${userInfo.role}
📅 تاريخ التسجيل: ${userInfo.registeredAt}

━━━━━━━━━━━━━━━━━━
`;


notifyAllUsers(message);


            res.json({ fullName:foundUser.full_name,email:foundUser.email,role:foundUser.role,accessToken })
};



exports.refresh = async (req, res) => {
    const cookies = req.cookies;
    
    if (!cookies?.jwt) {
        return res.status(401).json({ message: "الكوكيز غير موجودة!" });
    }
    
    const refreshToken = cookies.jwt;
    
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "❌ التوكن غير صالح أو منتهي الصلاحية!" });
        }
        
        const foundUser = await User.findById(decoded.UserInfo.id).exec();
        if (!foundUser) {
            return res.status(401).json({ message: "المستخدم غير موجود!" });
        }
        
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    id: foundUser._id,
                    name: foundUser.full_name,
                    role:foundUser.role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );
        
        res.json({ fullName: foundUser.full_name, email: foundUser.email,role:foundUser.role, accessToken });
    });
};


exports.logout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // تصحيح: sendStatus وليس sendstatus

    res.clearCookie("jwt", { // تصحيح: clearCookie وليس clearcookie
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });
    return res.sendStatus(204); // إرسال حالة 204 بعد مسح الكوكي
};