const express = require("express");

const {
  createTrainer,
  getTrainers,
  updateTrainer,
  deleteTrainer,
} = require("../controllers/trainerController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, adminOnly, createTrainer);

router.get("/", protect, getTrainers);

router.put("/:id", protect, adminOnly, updateTrainer);

router.delete("/:id", protect, adminOnly, deleteTrainer);

module.exports = router;