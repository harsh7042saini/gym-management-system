const express = require("express");

const {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
} = require("../controllers/memberController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, adminOnly, createMember);

router.get("/", protect, adminOnly, getMembers);

router.get("/:id", protect, getMemberById);

router.put("/:id", protect, adminOnly, updateMember);

router.delete("/:id", protect, adminOnly, deleteMember);

module.exports = router;