const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload");

const alumniController = require("../controllers/alumni.controller");

// PUBLIC / STUDENT ACCESS
router.get("/", alumniController.getAllAlumni);
router.get("/:id", alumniController.getAlumniById);

// ALUMNI ONLY
router.post(
  "/profile",
  authMiddleware,
  requireRole("ALUMNI"),
  upload.single("image"),
  alumniController.createProfile,
);

router.get(
  "/profile/me",
  authMiddleware,
  requireRole("ALUMNI"),
  alumniController.getMyProfile,
);

router.put(
  "/profile",
  authMiddleware,
  requireRole("ALUMNI"),
  upload.single("image"),
  alumniController.updateProfile,
);

router.delete(
  "/profile",
  authMiddleware,
  requireRole("ALUMNI"),
  alumniController.deleteProfile,
);

module.exports = router;
