const Member = require("../models/Member");

const createMember = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      age,
      address,
      membershipPlan,
      membershipType,
      membershipStart,
      membershipExpiry,
      membershipAmount,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !gender ||
      !age ||
      !membershipPlan ||
      !membershipStart ||
      !membershipExpiry
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required member details.",
      });
    }

    const existingMember = await Member.findOne({
      email: email.toLowerCase(),
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "Member with this email already exists.",
      });
    }

    const member = await Member.create({
      name,
      email,
      phone,
      gender,
      age,
      address,
      membershipPlan,
      membershipType: membershipType || "Single",
      membershipStart,
      membershipExpiry,
      membershipAmount: membershipAmount || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Member created successfully.",
      member,
    });
  } catch (error) {
    console.error("Create Member Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating member.",
      error: error.message,
    });
  }
};

const getMembers = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const members = await Member.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching members.",
      error: error.message,
    });
  }
};

const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    return res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

const updateMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    const allowedFields = [
      "name",
      "email",
      "phone",
      "gender",
      "age",
      "address",
      "membershipPlan",
      "membershipType",
      "membershipStart",
      "membershipExpiry",
      "membershipAmount",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        member[field] = req.body[field];
      }
    });

    await member.save();

    return res.status(200).json({
      success: true,
      message: "Member updated successfully.",
      member,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating member.",
      error: error.message,
    });
  }
};

const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    member.status = "Inactive";

    await member.save();

    return res.status(200).json({
      success: true,
      message: "Member deactivated successfully.",
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
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
};