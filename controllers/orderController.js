const User = require("../models/userModel");
const Order = require("../models/orderModel");
const bcrypt = require('bcrypt');

exports.getAllOrder = async (req, res) => {
    try {
        // استخدام NursingRequest بدلاً من Order
        const orders = await Order.find()
            .populate('patient', 'full_name email phone') // تصحيح: patient بدلاً من User
            .populate('nurse', 'full_name specialization') // إذا كنت تريد بيانات الممرض
            .sort({ createdAt: 1 });

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'لا توجد طلبات متاحة حالياً'
            });
        }

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders.map(order => ({
                _id: order._id,
                patient: order.patient, // تصحيح: patient بدلاً من user
                nurse: order.nurse,
                serviceType: order.serviceType, // إضافة حقول NursingRequest
                description: order.description,
                address: order.address,
                status: order.status,
                scheduledTime: order.scheduledTime,
                assignedAt: order.assignedAt,
                completedAt: order.completedAt,
                createdAt: order.createdAt
            }))
        });

    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في استرجاع الطلبات',
            error: err.message
        });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        // 1. البحث باستخدام النموذج الصحيح NursingRequest
        const orders = await Order.find({ 
            patient: req.user // البحث باستخدام حقل patient بدلاً من user
        })
        .populate('patient', 'full_name email phone') // بيانات المريض
        .populate('nurse', 'full_name specialization') // بيانات الممرض (إذا كان معينًا)
        .sort({ createdAt: 1 }); // الترتيب من الأقدم إلى الأحدث

        // 2. التحقق من وجود نتائج
        if (!orders || orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'لا توجد طلبات متاحة حالياً'
            });
        }

        // 3. إرسال الاستجابة
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders.map(order => ({
                _id: order._id,
                patient: order.patient, // تصحيح: patient بدلاً من user
                nurse: order.nurse,
                serviceType: order.serviceType, // إضافة حقول NursingRequest
                description: order.description,
                address: order.address,
                status: order.status,
                scheduledTime: order.scheduledTime,
                assignedAt: order.assignedAt,
                completedAt: order.completedAt,
                createdAt: order.createdAt
            }))
        });

    } catch (err) {
        console.error('حدث خطأ:', err);
        res.status(500).json({
            success: false,
            message: 'فشل في استرجاع طلبات التمريض',
            error: err.message
        });
    }
};


exports.newOrder = async (req, res) => {
    try {
        const { serviceType, description, address, scheduledTime } = req.body;
        // التحقق من البيانات المطلوبة
        if (!serviceType || !address || !scheduledTime) {
            return res.status(400).json({ 
                success: false,
                message: "نوع الخدمة والعنوان وموعد الخدمة حقول مطلوبة" 
            });
        }
        // إنشاء الطلب الجديد
        const newOrder = await Order.create({
            patient: req.user, // يتم أخذ id المريض من التوكن
            serviceType,
            description: description || '', // إذا لم يتم إدخال وصف
            address,
            scheduledTime,
            status: 'pending' // الحالة الافتراضية
        });

        res.status(201).json({
            success: true,
            message: "تم إنشاء طلب التمريض بنجاح",
            data: {
                requestId: newOrder._id,
                patient: newOrder.patient,
                serviceType: newOrder.serviceType,
                scheduledTime: newOrder.scheduledTime,
                status: newOrder.status
            }
        });

    } catch (err) {
        console.error('Error creating nursing request:', err);
        res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء إنشاء طلب التمريض",
            error: err.message
        });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('patient', 'full_name email phone') 
            .populate('nurse', 'full_name specialization') 
            .exec();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
            
        }

        res.status(200).json({
            success: true,
            data: {
                _id: order._id,
                patient: order.patient,
                nurse: order.nurse,
                serviceType: order.serviceType,
                description: order.description,
                address: order.address,
                status: order.status,
                scheduledTime: order.scheduledTime,
                assignedAt: order.assignedAt,
                completedAt: order.completedAt,
                createdAt: order.createdAt
            }
        });

    } catch (err) {
        console.error('حدث خطأ:', err);
        res.status(500).json({
            success: false,
            message: 'فشل في استرجاع تفاصيل الطلب',
            error: err.message
        });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByIdAndDelete(id)
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
            
        }

        res.status(200).json({
            success:true,
            message:"تم حذف الطلب بنجاح"
            
        })


    } catch (err) {
        console.error('حدث خطأ:', err);
        res.status(500).json({
            success: false,
            message: 'فشل في استرجاع تفاصيل الطلب',
            error: err.message
        });
    }
};

exports.assingNurseToOrder = async (req, res) => {
    try {
      const { id } = req.params;
      const { nurseId } = req.body;
  
      // التحقق من وجود الطلب
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'الطلب غير موجود'
        });
      }
  
      // التحقق إذا تم تعيين ممرض من قبل
      if (order.nurse) {
        return res.status(400).json({
          success: false,
          message: 'تم تعيين ممرض بالفعل لهذا الطلب'
        });
      }
  
      // التحقق من وجود الممرض
      const nurse = await User.findById(nurseId); // أو NurseModel لو عندك جدول مستقل
      if (!nurse || nurse.role !== 'nurse') {
        return res.status(400).json({
          success: false,
          message: 'الممرض غير موجود أو ليس له الصلاحية'
        });
      }
  
      // التعيين
      order.nurse = nurseId;
      order.status = 'assigned';
      order.assignedAt = new Date(); // حقل اختياري لتسجيل وقت التعيين
  
      await order.save();
  
      res.status(200).json({
        success: true,
        message: 'تم تعيين الممرض للطلب بنجاح',
        data: {
          id: order._id,
          nurse: nurse.full_name,
          status: order.status
        }
      });
  
    } catch (err) {
      console.error('خطأ أثناء تعيين الممرض:', err);
      res.status(500).json({
        success: false,
        message: 'فشل في تعيين الممرض',
        error: err.message
      });
    }
  };

  // controllers/orderController.js

exports.updateOrderStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      const allowedStatuses = ['pending', 'assigned','in-progress', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "الحالة غير مسموح بها"
        });
      }
  
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      )
      .populate('patient', 'full_name email')
      .populate('nurse', 'full_name specialization');
  
      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: "الطلب غير موجود"
        });
      }
  
      res.status(200).json({
        success: true,
        message: "تم تحديث حالة الطلب بنجاح",
        data: updatedOrder
      });
  
    } catch (err) {
      console.error('Error updating status:', err);
      res.status(500).json({
        success: false,
        message: "فشل في تحديث حالة الطلب",
        error: err.message
      });
    }
  };

  // controllers/orderController.js

exports.cancelOrderByPatient = async (req, res) => {
    try {
      const { id } = req.params;
  
      // البحث عن الطلب
      const order = await Order.findById(id);
  
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "الطلب غير موجود"
        });
      }
  
      // التأكد إن الطلب يخص المريض الحالي
      if (order.patient.toString() !== req.user.toString()) {
        return res.status(403).json({
          success: false,
          message: "غير مسموح لك بإلغاء هذا الطلب"
        });
      }
  
      // التأكد من إمكانية الإلغاء
      if (order.status === 'completed' || order.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: `لا يمكن إلغاء الطلب في حالته الحالية (${order.status})`
        });
      }
  
      // تحديث الحالة
      order.status = 'cancelled';
      await order.save();
  
      res.status(200).json({
        success: true,
        message: "تم إلغاء الطلب بنجاح",
        data: order
      });
  
    } catch (err) {
      console.error('Error cancelling order:', err);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء إلغاء الطلب",
        error: err.message
      });
    }
  };

 exports.getOrdersByStatus = async (req, res) => {
    try {
      const { status } = req.params;
      console.log({status})
  
      const allowedStatuses = ['pending','in-progress', 'assigned', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
 
        return res.status(400).json({
          success: false,
          message: "الحالة غير صالحة"
        });
      }
  
      const orders = await Order.find({ status })
        .populate('patient', 'full_name email phone')
        .populate('nurse', 'full_name specialization')
        .sort({ createdAt: -1 });
  
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
  
    } catch (err) {
      console.error("Error fetching orders by status:", err);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب الطلبات حسب الحالة",
        error: err.message
      });
    }
  };