const express = require("express");
const router = express.Router();
const { prisma } = require("../db");

// Get all groups
router.get("/", async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        memberships: {
          include: { user: true }
        }
      }
    });
    res.json(groups);
  } catch (error) {
    console.error("Fetch groups error:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

// Get members of a specific group
router.get("/:id/members", async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  if (isNaN(groupId)) {
    return res.status(400).json({ error: "Invalid group ID" });
  }

  try {
    const memberships = await prisma.groupMembership.findMany({
      where: { groupId },
      include: { user: true }
    });
    res.json(memberships);
  } catch (error) {
    console.error("Fetch group members error:", error);
    res.status(500).json({ error: "Failed to fetch group members" });
  }
});

// Update or create membership timeline (e.g., set leftAt date)
router.post("/:id/memberships", async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const { username, joinedAt, leftAt } = req.body;

  if (isNaN(groupId) || !username) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if membership already exists
    const existing = await prisma.groupMembership.findFirst({
      where: { groupId, userId: user.id }
    });

    let membership;
    if (existing) {
      membership = await prisma.groupMembership.update({
        where: { id: existing.id },
        data: {
          joinedAt: joinedAt ? new Date(joinedAt) : existing.joinedAt,
          leftAt: leftAt ? new Date(leftAt) : null
        }
      });
    } else {
      membership = await prisma.groupMembership.create({
        data: {
          groupId,
          userId: user.id,
          joinedAt: joinedAt ? new Date(joinedAt) : new Date(),
          leftAt: leftAt ? new Date(leftAt) : null
        }
      });
    }

    res.json(membership);
  } catch (error) {
    console.error("Update membership error:", error);
    res.status(500).json({ error: "Failed to update membership" });
  }
});

module.exports = router;
