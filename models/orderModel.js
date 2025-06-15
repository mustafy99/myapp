const mongoose = require('mongoose');

const nursingRequestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel',
    required: true
  },
  nurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel',
    default: null // يتم تعيينه لاحقًا من قبل المشرف
  },
  serviceType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledTime: {
    type: Date,
    required: true
    //الوقت الي المريض طلب فيه الخدمه ز بكره الساعه 10 
  },
  assignedAt: {
    type: Date
    //الوقت الي عين فيه المشرف الممرض وده بيتسجل تلقائيا عند التوزيع 
  },
  completedAt: {
    type: Date
    // الوقت الي خلصت فيها الخدمه 
  },
  createdAt: {
    type: Date,
    default: Date.now
    // وقت انشاء الطلب علي السيستم 
  }
});
module.exports = mongoose.model('NursingRequest', nursingRequestSchema);