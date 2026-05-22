require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const statsRoutes = require("./routes/stats");

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());

// ============================================
// DATABASE CONNECTION
// ============================================

const url = process.env.MONGODB_URI;

mongoose
  .connect(url)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Connection error:", err.message));

// Handle MongoDB disconnection
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err.message);
});

// ============================================
// ROUTES
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/stats", statsRoutes);

/**
 * Health check endpoint
 * Used for monitoring and load balancers
 */
app.get("/api/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime(),
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    error: "Reitti ei löytynyt",
    path: req.path,
    method: req.method,
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

/**
 * Central error handling middleware
 * This catches all errors from routes
 */
app.use((err, req, res, next) => {
  // Log error details
  console.error("❌ Error:", {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validointi epäonnistui",
      details: Object.keys(err.errors).map((key) => ({
        field: key,
        message: err.errors[key].message,
      })),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      error: `${field} on jo käytössä`,
      field: field,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Virheellinen tai vanhentunut istunto",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Istunto on vanhentunut. Kirjaudu uudelleen.",
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || "Palvelimen virhe",
    status: err.status || 500,
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

/**
 * Graceful shutdown handlers
 * Allow time for connections to close properly
 */
const gracefulShutdown = (signal) => {
  console.log(`\n📢 ${signal} received, shutting down gracefully...`);

  server.close(() => {
    console.log("🛑 HTTP server closed");

    mongoose.connection.close(false, () => {
      console.log("🔌 MongoDB connection closed");
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("❌ Forced shutdown after 10 seconds");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

module.exports = app;
