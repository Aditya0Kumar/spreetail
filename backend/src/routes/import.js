const express = require("express");
const router = express.Router();
const { prisma } = require("../db");
const { parseCSV } = require("../services/parser");

// Upload and analyze CSV
router.post("/upload", async (req, res) => {
  const { csvContent, fileName, groupId } = req.body;

  if (!csvContent || !groupId) {
    return res.status(400).json({ error: "csvContent and groupId are required" });
  }

  try {
    const job = await prisma.importJob.create({
      data: {
        fileName: fileName || "expenses_export.csv",
        status: "PENDING"
      }
    });

    // Parse the CSV content
    const { parsedExpenses, anomalies } = await parseCSV(csvContent);

    // Save anomalies in database
    const savedAnomalies = [];
    for (const anom of anomalies) {
      const saved = await prisma.importAnomaly.create({
        data: {
          importJobId: job.id,
          rowNumber: anom.rowNumber,
          anomalyType: anom.anomalyType,
          description: anom.description,
          rawData: anom.rawData,
          proposedAction: anom.proposedAction,
          status: "PENDING",
          resolvedExpenseData: anom.resolvedExpenseData
        }
      });
      savedAnomalies.push(saved);
    }

    res.json({
      importJobId: job.id,
      status: job.status,
      anomaliesCount: savedAnomalies.length,
      anomalies: savedAnomalies,
      parsedExpenses // raw drafts
    });
  } catch (error) {
    console.error("Upload import error:", error);
    res.status(500).json({ error: "Failed to parse and upload CSV: " + error.message });
  }
});

// Finalize import and resolve anomalies
router.post("/resolve", async (req, res) => {
  const { importJobId, groupId, resolutions } = req.body;
  // resolutions: Map of { rowNumber: { action: 'APPROVE' | 'REJECT' | 'EDIT', resolvedData: {...} } }

  if (!importJobId || !groupId || !resolutions) {
    return res.status(400).json({ error: "importJobId, groupId, and resolutions are required" });
  }

  try {
    const job = await prisma.importJob.findUnique({
      where: { id: parseInt(importJobId, 10) },
      include: { anomalies: true }
    });

    if (!job) {
      return res.status(404).json({ error: "Import job not found" });
    }

    const savedAnomalies = job.anomalies;
    const reportItems = [];

    // Begin transaction
    await prisma.$transaction(async (tx) => {
      // Loop over resolutions
      for (const rowNumStr of Object.keys(resolutions)) {
        const rowNumber = parseInt(rowNumStr, 10);
        const resolution = resolutions[rowNumStr]; // { action: 'APPROVE'|'REJECT'|'EDIT', resolvedData: {...} }
        const matchingAnoms = savedAnomalies.filter(a => a.rowNumber === rowNumber);

        // Update anomaly statuses in db
        for (const anom of matchingAnoms) {
          await tx.importAnomaly.update({
            where: { id: anom.id },
            data: {
              status: resolution.action === "REJECT" ? "REJECTED" : "APPROVED",
              proposedAction: resolution.action + " (Resolved by user)"
            }
          });
        }

        // Action policy processing
        if (resolution.action === "REJECT") {
          reportItems.push({
            rowNumber,
            description: `Row ${rowNumber} was rejected/deleted by the user.`,
            actionTaken: "DELETED/REJECTED"
          });
          continue; // skip importing this expense
        }

        // Data to save
        const expenseData = resolution.resolvedData;

        if (expenseData.isSettlement) {
          // Import as payment/settlement
          const payer = await tx.user.findUnique({ where: { username: expenseData.paidBy } });
          // split_with should have target recipient
          const payeeName = Array.isArray(expenseData.splits) && expenseData.splits.length > 0 
            ? expenseData.splits[0].user || expenseData.splits[0].username
            : expenseData.paidBy; // Fallback
          const payee = await tx.user.findUnique({ where: { username: payeeName } });

          if (payer && payee) {
            await tx.payment.create({
              data: {
                groupId: parseInt(groupId, 10),
                payerId: payer.id,
                payeeId: payee.id,
                amount: parseFloat(expenseData.amount),
                currency: expenseData.currency,
                exchangeRate: parseFloat(expenseData.exchangeRate) || 1.0,
                date: new Date(expenseData.date)
              }
            });
            reportItems.push({
              rowNumber,
              description: `Imported settlement: '${expenseData.description}' where ${expenseData.paidBy} paid ${payeeName} ${expenseData.amount} ${expenseData.currency}.`,
              actionTaken: "IMPORTED_AS_SETTLEMENT"
            });
          }
        } else {
          // Import as standard expense
          const payer = await tx.user.findUnique({ where: { username: expenseData.paidBy } });
          if (!payer) {
            throw new Error(`Payer ${expenseData.paidBy} not found for row ${rowNumber}`);
          }

          const expense = await tx.expense.create({
            data: {
              groupId: parseInt(groupId, 10),
              description: expenseData.description,
              amount: parseFloat(expenseData.amount),
              currency: expenseData.currency,
              exchangeRate: parseFloat(expenseData.exchangeRate) || 1.0,
              paidById: payer.id,
              date: new Date(expenseData.date),
              splitType: expenseData.splitType
            }
          });

          // Create splits
          for (const split of expenseData.splits) {
            // Support user, username, or splitUser formats from parser output
            const splitName = split.user || split.username;
            const splitUser = await tx.user.findUnique({ where: { username: splitName } });
            if (!splitUser) {
              throw new Error(`Split user ${splitName} not found for row ${rowNumber}`);
            }

            await tx.expenseSplit.create({
              data: {
                expenseId: expense.id,
                userId: splitUser.id,
                amount: parseFloat(split.amount),
                share: parseFloat(split.share) || 1.0
              }
            });
          }

          reportItems.push({
            rowNumber,
            description: `Imported expense: '${expenseData.description}' paid by ${expenseData.paidBy} of amount ${expenseData.amount} ${expenseData.currency} split among ${expenseData.splits.map(s => s.user || s.username).join(", ")}.`,
            actionTaken: "IMPORTED_AS_EXPENSE"
          });
        }
      }

      // Update job status
      await tx.importJob.update({
        where: { id: parseInt(importJobId, 10) },
        data: { status: "COMPLETED" }
      });
    }, {
      timeout: 60000
    });

    res.json({
      success: true,
      importJobId,
      status: "COMPLETED",
      report: reportItems
    });
  } catch (error) {
    console.error("Resolve import error:", error);
    res.status(500).json({ error: "Failed to finalize import: " + error.message });
  }
});

// Fetch reports
router.get("/report/:jobId", async (req, res) => {
  const jobId = parseInt(req.params.jobId, 10);
  if (isNaN(jobId)) {
    return res.status(400).json({ error: "Invalid Job ID" });
  }

  try {
    const job = await prisma.importJob.findUnique({
      where: { id: jobId },
      include: {
        anomalies: true
      }
    });

    if (!job) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("Fetch report error:", error);
    res.status(500).json({ error: "Failed to fetch import report" });
  }
});

module.exports = router;
