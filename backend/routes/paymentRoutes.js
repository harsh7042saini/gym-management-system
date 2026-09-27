const express = require("express");

const {
  createPayment,
  getPayments,
  getPaymentsByMember,
} = require("../controllers/paymentController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, adminOnly, createPayment);

router.get("/", protect, adminOnly, getPayments);

router.get(
  "/member/:memberId",
  protect,
  getPaymentsByMember
);

module.exports = router;