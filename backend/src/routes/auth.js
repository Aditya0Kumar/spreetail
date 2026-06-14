const express = require("express");
const router = express.Router();
const { prisma } = require("../db");

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        memberships: {
          include: { group: true }
        }
      }
    });
    res.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Simple select login
router.post("/login", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        memberships: {
          include: { group: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
