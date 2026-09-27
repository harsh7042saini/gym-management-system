const Payment = require("../models/Payment");
const Member = require("../models/Member");

const createPayment = async (req, res) => {
  try {
    const {
      member,
      amount,
      paymentDate,
      paymentMethod,
      status,
      nextDueDate,
      notes,
    } = req.body;

    if (!member || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Member and amount are required.",
      });
    }

    const memberExists = await Member.findById(member);

    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    const payment = await Payment.create({
      member,
      amount,
      paymentDate,
      paymentMethod,
      status: status || "Paid",
      nextDueDate: nextDueDate || null,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Payment record created successfully.",
      payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while creating payment.",
      error: error.message,
    });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("member", "name email phone membershipPlan")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching payments.",
      error: error.message,
    });
  }
};

const getPaymentsByMember = async (req, res) => {
  try {
    const payments = await Payment.find({
      member: req.params.memberId,
    }).sort({
      paymentDate: -1,
    });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
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
  createPayment,
  getPayments,
  getPaymentsByMember,
};