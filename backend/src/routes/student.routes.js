const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const studentController = require("../controllers/student.controller");
const upload = require("../middlewares/upload")

router.use(authMiddleware);
router.use(requireRole("STUDENT"));

router.post("/profile", upload.single("photo"), studentController.createProfile);
router.get("/profile/me", studentController.getMyProfile);
router.put("/profile", studentController.updateProfile);
router.get("/dashboard", studentController.getDashboard);

module.exports = router;
