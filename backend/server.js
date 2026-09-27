const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Mind Control Gym API is running successfully.",
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/members", require("./routes/memberRoutes"));

app.use("/api/payments", require("./routes/paymentRoutes"));

app.use("/api/trainers", require("./routes/trainerRoutes"));

app.use("/api/workouts", require("./routes/workoutRoutes"));

app.use(
  "/api/dashboard",
  require("./routes/dashboardRoutes")
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});