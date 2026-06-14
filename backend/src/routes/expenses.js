const express = require("express");
const router = express.Router();
const { prisma } = require("../db");
const { computeGroupBalances, simplifyDebts, getPairwiseLedger } = require("../services/ledger");

// Get all expenses for a group
router.get("/", async (req, res) => {
  const groupId = parseInt(req.query.groupId, 10);
  if (isNaN(groupId)) {
    return res.status(400).json({ error: "groupId is required" });
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        paidBy: true,
        splits: {
          include: { user: true }
        }
      },
      orderBy: { date: "desc" }
    });
    res.json(expenses);
  } catch (error) {
    console.error("Fetch expenses error:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// Create new expense
router.post("/", async (req, res) => {
  const { groupId, description, amount, currency, exchangeRate, paidByUsername, date, splitType, splits } = req.body;

  if (!groupId || !description || isNaN(amount) || !paidByUsername || !date || !splitType || !splits) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const payer = await prisma.user.findUnique({ where: { username: paidByUsername } });
    if (!payer) {
      return res.status(404).json({ error: "Payer not found" });
    }

    // Wrap in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          groupId,
          description,
          amount: parseFloat(amount),
          currency: currency || "INR",
          exchangeRate: parseFloat(exchangeRate) || 1.0,
          paidById: payer.id,
          date: new Date(date),
          splitType
        }
      });

      // Create splits
      for (const s of splits) {
        const splitUser = await tx.user.findUnique({ where: { username: s.username } });
        if (!splitUser) {
          throw new Error(`Split user ${s.username} not found`);
        }
        await tx.expenseSplit.create({
          data: {
            expenseId: expense.id,
            userId: splitUser.id,
            amount: parseFloat(s.amount),
            share: parseFloat(s.share) || 1.0
          }
        });
      }

      return expense;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ error: error.message || "Failed to create expense" });
  }
});

// Delete an expense
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Delete splits first
      await tx.expenseSplit.deleteMany({ where: { expenseId: id } });
      await tx.expense.delete({ where: { id } });
    });
    res.json({ success: true, message: "Expense deleted" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// Get group balances summary
router.get("/balances", async (req, res) => {
  const groupId = parseInt(req.query.groupId, 10);
  if (isNaN(groupId)) {
    return res.status(400).json({ error: "groupId is required" });
  }

  try {
    const balances = await computeGroupBalances(groupId);
    res.json(balances);
  } catch (error) {
    console.error("Get balances error:", error);
    res.status(500).json({ error: "Failed to compute balances" });
  }
});

// Aisha's View: Get simplified debts
router.get("/simplified-debts", async (req, res) => {
  const groupId = parseInt(req.query.groupId, 10);
  if (isNaN(groupId)) {
    return res.status(400).json({ error: "groupId is required" });
  }

  try {
    const balances = await computeGroupBalances(groupId);
    const simplified = simplifyDebts(balances);
    res.json(simplified);
  } catch (error) {
    console.error("Get simplified debts error:", error);
    res.status(500).json({ error: "Failed to simplify debts" });
  }
});

// Rohan's View: Get pairwise ledger audit trail
router.get("/audit-ledger", async (req, res) => {
  const groupId = parseInt(req.query.groupId, 10);
  const { userA, userB } = req.query;

  if (isNaN(groupId) || !userA || !userB) {
    return res.status(400).json({ error: "groupId, userA, and userB are required" });
  }

  try {
    const audit = await getPairwiseLedger(groupId, userA, userB);
    res.json(audit);
  } catch (error) {
    console.error("Get audit ledger error:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve ledger" });
  }
});

// Settle debts (create a Payment record)
router.post("/settlement", async (req, res) => {
  const { groupId, payerUsername, payeeUsername, amount, currency, exchangeRate, date } = req.body;

  if (!groupId || !payerUsername || !payeeUsername || isNaN(amount) || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const payer = await prisma.user.findUnique({ where: { username: payerUsername } });
    const payee = await prisma.user.findUnique({ where: { username: payeeUsername } });

    if (!payer || !payee) {
      return res.status(404).json({ error: "Payer or Payee not found" });
    }

    const payment = await prisma.payment.create({
      data: {
        groupId,
        payerId: payer.id,
        payeeId: payee.id,
        amount: parseFloat(amount),
        currency: currency || "INR",
        exchangeRate: parseFloat(exchangeRate) || 1.0,
        date: new Date(date)
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error("Settle debt error:", error);
    res.status(500).json({ error: "Failed to record settlement" });
  }
});

// Get all settlements/payments for a group
router.get("/settlements", async (req, res) => {
  const groupId = parseInt(req.query.groupId, 10);
  if (isNaN(groupId)) {
    return res.status(400).json({ error: "groupId is required" });
  }

  try {
    const payments = await prisma.payment.findMany({
      where: { groupId },
      include: {
        payer: true,
        payee: true
      },
      orderBy: { date: "desc" }
    });
    res.json(payments);
  } catch (error) {
    console.error("Fetch settlements error:", error);
    res.status(500).json({ error: "Failed to fetch settlements" });
  }
});

module.exports = router;
