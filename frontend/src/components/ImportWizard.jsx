import React, { useState } from "react";
import { Upload, AlertTriangle, CheckCircle, Edit, Loader2, ArrowRight, Download, Check, RefreshCw, ShieldAlert, X } from "lucide-react";

export default function ImportWizard({ backendUrl, groupId, onImportComplete, currentUser }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");
  const [importJobId, setImportJobId] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [draftExpenses, setDraftExpenses] = useState([]);
  const [resolutions, setResolutions] = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [importReport, setImportReport] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (event) => await uploadCSVContent(event.target.result, file.name);
    reader.readAsText(file);
  };

  const loadSampleCSV = async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch("/Expenses%20Export.csv");
      if (!response.ok) throw new Error("Could not find sample CSV file.");
      const text = await response.text();
      setFileName("Expenses Export.csv");
      await uploadCSVContent(text, "Expenses Export.csv");
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const uploadCSVContent = async (csvContent, name) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${backendUrl}/api/import/upload`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent, fileName: name, groupId })
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to analyze CSV"); }
      const data = await res.json();
      setImportJobId(data.importJobId); setAnomalies(data.anomalies); setDraftExpenses(data.parsedExpenses);
      const initialResolutions = {};
      data.parsedExpenses.forEach((exp) => {
        initialResolutions[exp.rowNumber] = { action: "APPROVE", resolvedData: JSON.parse(JSON.stringify(exp)) };
      });
      data.anomalies.forEach((anom) => {
        if (anom.anomalyType === "DUPLICATE_EXPENSE") initialResolutions[anom.rowNumber].action = "REJECT";
      });
      setResolutions(initialResolutions); setStep(2);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const toggleRowAction = (rowNumber, action) => {
    setResolutions((prev) => { const copy = { ...prev }; copy[rowNumber].action = action; return copy; });
  };

  const startEditing = (rowNumber) => {
    const data = resolutions[rowNumber].resolvedData;
    setEditingRow(rowNumber);
    setEditFormData({
      rowNumber, description: data.description, amount: data.amount, currency: data.currency,
      exchangeRate: data.exchangeRate, paidBy: data.paidBy, date: data.date ? data.date.split("T")[0] : "",
      splitType: data.splitType, splits: [...data.splits], isSettlement: data.isSettlement
    });
  };

  const handleEditFieldChange = (field, value) => {
    setEditFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "splitType" && value === "equal") {
        const count = prev.splits.length;
        updated.splits = prev.splits.map(s => ({ ...s, share: 1.0, amount: parseFloat(prev.amount) / count }));
      }
      return updated;
    });
  };

  const handleEditSplitChange = (index, value) => {
    setEditFormData((prev) => {
      const newSplits = [...prev.splits];
      newSplits[index] = { ...newSplits[index], amount: parseFloat(value) || 0 };
      return { ...prev, splits: newSplits };
    });
  };

  const saveRowEdit = () => {
    const updatedData = { ...editFormData, date: new Date(editFormData.date).toISOString() };
    setResolutions((prev) => { const copy = { ...prev }; copy[editingRow] = { action: "EDIT", resolvedData: updatedData }; return copy; });
    setEditingRow(null); setEditFormData(null);
  };

  const submitResolutions = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${backendUrl}/api/import/resolve`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importJobId, groupId, resolutions })
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to save resolutions"); }
      const data = await res.json();
      setImportReport(data.report); setStep(3);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const getSeverityStyle = (sev) => {
    if (sev === "error") return { bg: "var(--danger-light)", color: "var(--danger)", border: "var(--danger)" };
    if (sev === "warning") return { bg: "var(--warning-light)", color: "var(--warning)", border: "var(--warning)" };
    return { bg: "var(--info-light)", color: "var(--info)", border: "var(--info)" };
  };

  const stepLabels = ["Upload CSV", "Resolve (Meera's View)", "Import Report"];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Step Indicator */}
      <div className="flex justify-center items-center mb-8 gap-2">
        {stepLabels.map((label, i) => {
          const stepNum = i + 1;
          const isActive = step >= stepNum;
          return (
            <React.Fragment key={i}>
              {i > 0 && <div className="w-8 h-px" style={{ background: isActive ? "var(--accent)" : "var(--border-primary)" }} />}
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{ background: isActive ? "var(--accent)" : "var(--bg-tertiary)", color: isActive ? "var(--text-inverse)" : "var(--text-tertiary)", border: `1px solid ${isActive ? "var(--accent)" : "var(--border-primary)"}` }}>
                  {step > stepNum ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </span>
                <span className="text-xs font-medium hidden sm:inline" style={{ color: isActive ? "var(--accent-text)" : "var(--text-tertiary)" }}>{label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded-xl flex gap-3 mb-6 items-center text-sm" style={{ background: "var(--danger-light)", color: "var(--danger)", border: "1px solid var(--danger)" }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" /> <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div className="surface-elevated p-12 rounded-3xl text-center max-w-xl mx-auto relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: "linear-gradient(90deg, var(--accent), #0d9488, var(--accent))" }} />
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--accent-light)" }}>
            {loading ? <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--accent)" }} /> : <Upload className="w-10 h-10" style={{ color: "var(--accent)" }} />}
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Upload Expenses CSV</h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Select the spreadsheet export <strong>(Expenses Export.csv)</strong>. Our analyzer will detect duplicates, casing problems, USD rates, and timeline anomalies.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            <label className="btn-primary px-6 py-4 cursor-pointer text-sm">
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" disabled={loading} />
              {loading ? "Analyzing..." : "Select CSV File"}
            </label>
            <button onClick={loadSampleCSV} disabled={loading} className="btn-secondary px-6 py-4 text-sm" style={{ color: "var(--accent-text)" }}>
              {loading ? "Loading..." : "Load Sample CSV"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ANOMALY RESOLUTION */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="surface p-6 rounded-2xl flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <ShieldAlert className="w-6 h-6" style={{ color: "var(--warning)" }} />
                Anomaly Validation Queue
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Found <strong style={{ color: "var(--warning)" }}>{anomalies.length} discrepancies</strong> in <em>{fileName}</em>.
              </p>
            </div>
            <button onClick={submitResolutions} disabled={loading} className="btn-primary px-6 py-3">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Finalizing...</> : <><CheckCircle className="w-4 h-4" /> Finalize & Ingest</>}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {draftExpenses.map((exp) => {
                const rowAnoms = exp.anomalies || [];
                const res = resolutions[exp.rowNumber] || { action: "APPROVE" };
                const isRejected = res.action === "REJECT";
                const isEdited = res.action === "EDIT";
                return (
                  <div key={exp.rowNumber} className="surface p-5 rounded-xl transition-all duration-200" style={{
                    opacity: isRejected ? 0.5 : 1,
                    borderColor: isRejected ? "var(--danger)" : isEdited ? "var(--warning)" : rowAnoms.length > 0 ? "var(--warning)" : "var(--border-primary)",
                  }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="badge" style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}>Row {exp.rowNumber}</span>
                          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{new Date(exp.date).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-semibold text-base mt-1" style={{ color: "var(--text-primary)", textDecoration: isRejected ? "line-through" : "none" }}>
                          {exp.description}
                        </h4>
                      </div>
                      <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)" }}>
                        {[
                          { action: "APPROVE", label: "Approve", activeStyle: { bg: "var(--accent-light)", color: "var(--accent-text)" } },
                          { action: "REJECT", label: "Reject", activeStyle: { bg: "var(--danger-light)", color: "var(--danger)" } },
                          { action: "EDIT", label: "Edit", activeStyle: { bg: "var(--warning-light)", color: "var(--warning)" }, onClick: () => startEditing(exp.rowNumber) },
                        ].map(({ action, label, activeStyle, onClick }) => (
                          <button key={action}
                            onClick={onClick || (() => toggleRowAction(exp.rowNumber, action))}
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all duration-200"
                            style={{ background: res.action === action ? activeStyle.bg : "transparent", color: res.action === action ? activeStyle.color : "var(--text-tertiary)" }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {!isRejected && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg text-xs mb-3" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                        {[
                          { label: "Payer", value: res.resolvedData.paidBy },
                          { label: "Amount", value: `${res.resolvedData.amount} ${res.resolvedData.currency}${res.resolvedData.exchangeRate !== 1 ? ` (≈ ${(res.resolvedData.amount * res.resolvedData.exchangeRate).toFixed(0)} INR)` : ""}` },
                          { label: "Split Type", value: res.resolvedData.splitType },
                          { label: "Splits", value: res.resolvedData.splits.map(s => s.user || s.username).join(", ") },
                        ].map((item, i) => (
                          <div key={i}>
                            <span className="block" style={{ color: "var(--text-tertiary)" }}>{item.label}:</span>
                            <span className="font-semibold capitalize" style={{ color: "var(--text-primary)" }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {rowAnoms.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        {rowAnoms.map((anom, aIdx) => {
                          const s = getSeverityStyle(anom.severity);
                          return (
                            <div key={aIdx} className="flex gap-2 items-start p-2.5 rounded-lg text-xs" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}22` }}>
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold uppercase text-[9px] block mb-0.5 tracking-wider">{anom.type || "ANOMALY"}</span>
                                <p>{anom.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sidebar Summary */}
            <div>
              <div className="surface-elevated p-6 rounded-2xl sticky top-6">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid var(--border-primary)", color: "var(--text-primary)" }}>
                  <RefreshCw className="w-4 h-4" style={{ color: "var(--accent)" }} /> Ingestion Summary
                </h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Total Rows", value: draftExpenses.length, color: "var(--text-primary)" },
                    { label: "Anomalies Found", value: anomalies.length, color: "var(--warning)" },
                    { label: "Approved", value: Object.values(resolutions).filter(r => r.action === "APPROVE").length, color: "var(--accent-text)" },
                    { label: "Rejected", value: Object.values(resolutions).filter(r => r.action === "REJECT").length, color: "var(--danger)" },
                    { label: "Edited", value: Object.values(resolutions).filter(r => r.action === "EDIT").length, color: "var(--warning)" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>{item.label}:</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 text-xs leading-relaxed" style={{ borderTop: "1px solid var(--border-primary)", color: "var(--text-tertiary)" }}>
                  Meera's policy: "I want to approve anything the app deletes or changes." Duplicates default to <strong>Reject</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingRow && editFormData && (
        <div className="modal-overlay">
          <div className="surface-elevated max-w-lg w-full rounded-2xl p-6 overflow-y-auto max-h-[90vh] animate-fadeIn">
            <div className="flex justify-between items-center mb-4 pb-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
              <h3 className="text-lg font-bold flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                <Edit className="w-5 h-5" style={{ color: "var(--warning)" }} /> Edit Row {editingRow}
              </h3>
              <button onClick={() => { setEditingRow(null); setEditFormData(null); }} className="p-1.5 rounded-lg transition" style={{ color: "var(--text-tertiary)" }}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Description</label>
                <input type="text" value={editFormData.description} onChange={(e) => handleEditFieldChange("description", e.target.value)} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Amount</label>
                  <input type="number" step="any" value={editFormData.amount} onChange={(e) => handleEditFieldChange("amount", parseFloat(e.target.value) || 0)} className="input-field" />
                </div>
                <div>
                  <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Currency</label>
                  <select value={editFormData.currency} onChange={(e) => handleEditFieldChange("currency", e.target.value)} className="input-field">
                    <option value="INR">INR</option><option value="USD">USD</option>
                  </select>
                </div>
              </div>
              {editFormData.currency === "USD" && (
                <div>
                  <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Exchange Rate</label>
                  <input type="number" step="0.01" value={editFormData.exchangeRate} onChange={(e) => handleEditFieldChange("exchangeRate", parseFloat(e.target.value) || 1.0)} className="input-field" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Payer</label>
                  <select value={editFormData.paidBy} onChange={(e) => handleEditFieldChange("paidBy", e.target.value)} className="input-field">
                    {["Aisha","Rohan","Priya","Meera","Sam","Dev"].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Date</label>
                  <input type="date" value={editFormData.date} onChange={(e) => handleEditFieldChange("date", e.target.value)} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Split Type</label>
                <select value={editFormData.splitType} onChange={(e) => handleEditFieldChange("splitType", e.target.value)} className="input-field">
                  <option value="equal">Equal</option><option value="unequal">Unequal / Custom</option>
                </select>
              </div>
              {editFormData.splits.length > 0 && (
                <div>
                  <label className="text-xs block mb-2 font-medium" style={{ color: "var(--text-secondary)" }}>Split Shares</label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {editFormData.splits.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-lg text-xs" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{s.user || s.username}</span>
                        {editFormData.splitType === "equal" ? (
                          <span className="font-mono" style={{ color: "var(--text-secondary)" }}>{(editFormData.amount / editFormData.splits.length).toFixed(2)}</span>
                        ) : (
                          <input type="number" value={s.amount} onChange={(e) => handleEditSplitChange(idx, e.target.value)} className="input-field w-24 text-right py-1 px-2" style={{ fontSize: "0.75rem" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6 pt-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
              <button onClick={() => { setEditingRow(null); setEditFormData(null); }} className="btn-secondary flex-1 text-xs">Cancel</button>
              <button onClick={saveRowEdit} className="btn-primary flex-1 text-xs">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: REPORT */}
      {step === 3 && (
        <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
          <div className="surface-elevated p-8 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: "linear-gradient(90deg, var(--accent), #0d9488)" }} />
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--accent-light)" }}>
              <Check className="w-8 h-8" style={{ color: "var(--accent)" }} />
            </div>
            <h2 className="text-3xl font-extrabold mb-2 text-gradient">Import Complete!</h2>
            <p className="text-sm max-w-md mx-auto mb-6" style={{ color: "var(--text-secondary)" }}>
              All validated expenses and settlements have been written to the database.
            </p>
            <button onClick={onImportComplete} className="btn-primary px-8 py-3 text-sm">Go to Dashboard</button>
          </div>

          <div className="surface p-6 rounded-2xl">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid var(--border-primary)", color: "var(--text-primary)" }}>
              <Download className="w-4 h-4" style={{ color: "var(--accent)" }} /> Import Action Log
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-primary)" }}>
                    <th className="pb-3 font-semibold text-[10px] uppercase tracking-wider w-16" style={{ color: "var(--text-tertiary)" }}>Row</th>
                    <th className="pb-3 font-semibold text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Description</th>
                    <th className="pb-3 font-semibold text-[10px] uppercase tracking-wider text-right w-44" style={{ color: "var(--text-tertiary)" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {importReport.map((item, idx) => (
                    <tr key={idx} className="transition-colors duration-150" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td className="py-3 font-mono" style={{ color: "var(--text-tertiary)" }}>Row {item.rowNumber}</td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{item.description}</td>
                      <td className="py-3 text-right">
                        <span className={`badge ${item.actionTaken === "DELETED/REJECTED" ? "badge-danger" : item.actionTaken === "IMPORTED_AS_SETTLEMENT" ? "badge-info" : "badge-success"}`}>
                          {item.actionTaken}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
