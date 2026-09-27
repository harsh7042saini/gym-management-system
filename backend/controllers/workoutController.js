const WorkoutPlan = require("../models/WorkoutPlan");
const Member = require("../models/Member");
const Trainer = require("../models/Trainer");

const createWorkoutPlan = async (req, res) => {
  try {
    const {
      member,
      trainer,
      planName,
      goal,
      exercises,
      notes,
    } = req.body;

    if (!member || !planName) {
      return res.status(400).json({
        success: false,
        message: "Member and plan name are required.",
      });
    }

    const memberExists = await Member.findById(member);

    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    if (trainer) {
      const trainerExists = await Trainer.findById(trainer);

      if (!trainerExists) {
        return res.status(404).json({
          success: false,
          message: "Trainer not found.",
        });
      }
    }

    const workoutPlan = await WorkoutPlan.create({
      member,
      trainer: trainer || null,
      planName,
      goal,
      exercises: exercises || [],
      notes,
    });

    const populatedPlan = await WorkoutPlan.findById(
      workoutPlan._id
    )
      .populate("member", "name email phone")
      .populate("trainer", "name specialization");

    return res.status(201).json({
      success: true,
      message: "Workout plan created successfully.",
      workoutPlan: populatedPlan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while creating workout plan.",
      error: error.message,
    });
  }
};

const getWorkoutPlans = async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.find()
      .populate("member", "name email phone")
      .populate("trainer", "name specialization")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: workoutPlans.length,
      workoutPlans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching workout plans.",
      error: error.message,
    });
  }
};

const getWorkoutPlansByMember = async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.find({
      member: req.params.memberId,
    })
      .populate("trainer", "name specialization")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: workoutPlans.length,
      workoutPlans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

const updateWorkoutPlan = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("member", "name email phone")
      .populate("trainer", "name specialization");

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workout plan updated successfully.",
      workoutPlan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

const deleteWorkoutPlan = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findByIdAndDelete(
      req.params.id
    );

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workout plan deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

module.exports = {
  createWorkoutPlan,
  getWorkoutPlans,
  getWorkoutPlansByMember,
  updateWorkoutPlan,
  deleteWorkoutPlan,
};