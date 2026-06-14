require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { autoSeed } = require("./db");

const authRouter = require("./routes/auth");
const groupsRouter = require("./routes/groups");
const expensesRouter = require("./routes/expenses");
const importRouter = require("./routes/import");
const chatRouter = require("./routes/chat");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increase limit for large CSV transfers
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Endpoints
app.use("/api/auth", authRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/import", importRouter);
app.use("/api/chat", chatRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Start server and trigger database self-seed check
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Perform self-seed check
  await autoSeed();
});
