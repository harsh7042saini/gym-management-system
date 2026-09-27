const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    age: {
      type: Number,
      required: true,
      min: 10,
      max: 100,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    membershipPlan: {
      type: String,
      enum: ["1 Month", "3 Months", "6 Months", "12 Months"],
      required: true,
    },

    membershipType: {
      type: String,
      enum: ["Single", "Couple"],
      default: "Single",
    },

    membershipStart: {
      type: Date,
      required: true,
    },

    membershipExpiry: {
      type: Date,
      required: true,
    },

    membershipAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Expired", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);