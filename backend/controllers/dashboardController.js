const Member = require("../models/Member");
const Payment = require("../models/Payment");
const Trainer = require("../models/Trainer");
const WorkoutPlan = require("../models/WorkoutPlan");

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();

    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(
      thirtyDaysLater.getDate() + 30
    );

    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      totalTrainers,
      totalWorkoutPlans,
      duePayments,
      recentMembers,
    ] = await Promise.all([
      Member.countDocuments(),

      Member.countDocuments({
        status: "Active",
        membershipExpiry: {
          $gte: today,
        },
      }),

      Member.countDocuments({
        $or: [
          {
            status: "Expired",
          },
          {
            membershipExpiry: {
              $lt: today,
            },
          },
        ],
      }),

      Trainer.countDocuments({
        status: "Active",
      }),

      WorkoutPlan.countDocuments(),

      Payment.countDocuments({
        status: "Due",
      }),

      Member.find()
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "name email phone membershipPlan membershipExpiry status"
        ),
    ]);

    const expiringSoon = await Member.countDocuments({
      membershipExpiry: {
        $gte: today,
        $lte: thirtyDaysLater,
      },
      status: "Active",
    });

    const paidPayments = await Payment.find({
      status: "Paid",
    });

    const totalRevenue = paidPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    return res.status(200).json({
      success: true,

      stats: {
        totalMembers,
        activeMembers,
        expiredMembers,
        totalTrainers,
        totalWorkoutPlans,
        duePayments,
        expiringSoon,
        totalRevenue,
      },

      recentMembers,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard.",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};