const express = require("express");
const router = express.Router();
const { 
    getAllOrder,
    newOrder,
    getUserOrders,
    getOrderDetails,
    deleteOrder,
    assingNurseToOrder,
    updateOrderStatus,
    cancelOrderByPatient,
    getOrdersByStatus
} = require("../controllers/orderController");
const {
    verifyJwt,
    IsAdmin,
    IsAdminOrSupervisor
} = require("../middleware/authMiddleware");

router.use(verifyJwt);

router.route("/")
    .get(IsAdminOrSupervisor, getAllOrder) // للمشرفين فقط
    .post(newOrder); // أي مستخدم مسجل

router.route("/me")
    .get(getUserOrders); // طلبات المستخدم الحالي

router.route("/:id").get(getOrderDetails)

router.route("/:id").delete(IsAdminOrSupervisor,deleteOrder)
router.route("/assing/:id").put(IsAdminOrSupervisor,assingNurseToOrder)
router.route("/status/:id").put(IsAdminOrSupervisor,updateOrderStatus)
router.route("/cancel/:id").put(cancelOrderByPatient) 
router.route("/status/:status").get(getOrdersByStatus)//

module.exports = router;