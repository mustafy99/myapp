const express = require("express");

const router = express.Router();
const { 
    getAllUsers,
    getUsers,
    getNurses,
    getUsersById,
    updateUsersById,
    updatepassById,
    updateemailById,
    deleteUser

} = require("../controllers/usersController");
const {
    verifyJwt,
    IsAdmin,
    IsAdminOrSupervisor

} = require("../middleware/authMiddleware")



router.use(verifyJwt); // يطبق على جميع المسارات تحته

router.route("/").get(IsAdmin, getAllUsers); // لا حاجة لـ verifyJwt مرة أخرى
router.route("/me").get(getUsers);
router.route("/nurse").get(IsAdminOrSupervisor, getNurses); 

router.route("/:id").get(getUsersById);
router.route("/:id").put(updateUsersById);

router.route("/:id/update-password").put(updatepassById);

router.route("/:id/update-email").put(updateemailById);

router.route("/:id").delete(IsAdmin, deleteUser);
module.exports = router;