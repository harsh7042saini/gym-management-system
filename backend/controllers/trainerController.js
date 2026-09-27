const Trainer = require("../models/Trainer");

const createTrainer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      specialization,
      experience,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Trainer name and phone are required.",
      });
    }

    const trainer = await Trainer.create({
      name,
      phone,
      email,
      specialization,
      experience: experience || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Trainer created successfully.",
      trainer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while creating trainer.",
      error: error.message,
    });
  }
};

const getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: trainers.length,
      trainers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching trainers.",
      error: error.message,
    });
  }
};

const updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trainer updated successfully.",
      trainer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found.",
      });
    }

    trainer.status = "Inactive";

    await trainer.save();

    return res.status(200).json({
      success: true,
      message: "Trainer deactivated successfully.",
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
  createTrainer,
  getTrainers,
  updateTrainer,
  deleteTrainer,
};