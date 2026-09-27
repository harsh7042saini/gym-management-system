const express = require("express");

const {
  createWorkoutPlan,
  getWorkoutPlans,
  getWorkoutPlansByMember,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} = require("../controllers/workoutController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, adminOnly, createWorkoutPlan);

router.get("/", protect, adminOnly, getWorkoutPlans);

router.get(
  "/member/:memberId",
  protect,
  getWorkoutPlansByMember
);

router.put("/:id", protect, adminOnly, updateWorkoutPlan);

router.delete("/:id", protect, adminOnly, deleteWorkoutPlan);

module.exports = router;