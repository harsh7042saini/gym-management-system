const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    exerciseName: {
      type: String,
      required: true,
      trim: true,
    },

    sets: {
      type: Number,
      default: 0,
    },

    reps: {
      type: Number,
      default: 0,
    },

    duration: {
      type: String,
      default: "",
      trim: true,
    },

    instructions: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      default: null,
    },

    planName: {
      type: String,
      required: true,
      trim: true,
    },

    goal: {
      type: String,
      default: "",
      trim: true,
    },

    exercises: {
      type: [exerciseSchema],
      default: [],
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WorkoutPlan", workoutPlanSchema);