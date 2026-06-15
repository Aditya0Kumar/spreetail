const express = require("express");
const router = express.Router();
const { prisma } = require("../db");
const { computeGroupBalances, simplifyDebts } = require("../services/ledger");
const { GoogleGenAI } = require("@google/genai");

router.post("/", async (req, res) => {
  const { message, groupId, apiKey: clientApiKey } = req.body;

  if (!message || !groupId) {
    return res.status(400).json({ error: "message and groupId are required" });
  }

  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({
      error: "MISSING_API_KEY",
      reply: "Please provide your Gemini API key to activate the assistant."
    });
  }

  try {
    // 1. Fetch entire database state for the group to provide as context
    const users = await prisma.user.findMany({
      include: {
        memberships: {
          where: { groupId }
        }
      }
    });

    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        paidBy: true,
        splits: {
          include: { user: true }
        }
      },
      orderBy: { date: "asc" }
    });

    const payments = await prisma.payment.findMany({
      where: { groupId },
      include: {
        payer: true,
        payee: true
      },
      orderBy: { date: "asc" }
    });

    const balances = await computeGroupBalances(groupId);
    const simplified = simplifyDebts(balances);

    // 2. Format database context for prompt
    let context = "GROUP EXPENSES APP CONTEXT STATE:\n\n";

    context += "MEMBERS:\n";
    users.forEach(u => {
      const membership = u.memberships[0];
      const leftStr = membership?.leftAt ? `(Moved out on ${membership.leftAt.toISOString().split("T")[0]})` : "";
      const joinedStr = membership?.joinedAt ? `(Moved in on ${membership.joinedAt.toISOString().split("T")[0]})` : "";
      context += `- ${u.username} ${joinedStr} ${leftStr}\n`;
    });

    context += "\nEXPENSES HISTORY:\n";
    expenses.forEach(e => {
      const splitDetails = e.splits.map(s => `${s.user.username} (owed: ${s.amount} ${e.currency})`).join(", ");
      context += `- Date: ${e.date.toISOString().split("T")[0]} | Desc: "${e.description}" | Paid By: ${e.paidBy.username} | Amount: ${e.amount} ${e.currency} (Converted: ${e.amount * e.exchangeRate} INR) | Splits: [${splitDetails}]\n`;
    });

    context += "\nSETTLEMENTS / PAYMENTS HISTORY:\n";
    payments.forEach(p => {
      context += `- Date: ${p.date.toISOString().split("T")[0]} | ${p.payer.username} paid ${p.payee.username} ${p.amount} ${p.currency} (Converted: ${p.amount * p.exchangeRate} INR)\n`;
    });

    context += "\nCURRENT NET BALANCES (INR):\n";
    Object.values(balances).forEach(b => {
      context += `- ${b.username}: Net Balance: ${b.net} INR (Paid: ${b.paid}, Owed: ${b.owed}, Sent: ${b.sent}, Received: ${b.received})\n`;
    });

    context += "\nSIMPLIFIED DEBTS (Who pays whom, how much):\n";
    simplified.forEach(s => {
      context += `- ${s.from} should pay ${s.to} ${s.amount} INR\n`;
    });

    // 3. Setup system instructions and run AI
    const systemPrompt = `You are a helpful shared expense tracking AI assistant called Spreetail Expense bot.
You help a group of flatmates (Aisha, Rohan, Priya, Meera, Sam, Dev) manage their shared household ledger.
You have access to the full real-time database state below. Answer the user's questions accurately using only this data.
Keep your answers clear, friendly, and structured. Use Markdown formatting.

${context}

User question: "${message}"
Response:`;

    const aiClient = new GoogleGenAI({ apiKey });
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });

    res.json({
      reply: response.text
    });
  } catch (error) {
    console.error("AI Assistant error:", error);
    res.status(500).json({ error: "AI Assistant failed to generate response: " + error.message });
  }
});

module.exports = router;
