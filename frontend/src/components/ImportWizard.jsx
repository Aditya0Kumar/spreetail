import React, { useState } from "react";
import { Upload, AlertTriangle, CheckCircle, Edit, Loader2, Download, Check, ShieldAlert, X } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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
    if (sev === "error" || sev === "High") return { bg: "bg-red-50", color: "text-red-600", border: "border-red-200" };
    if (sev === "warning" || sev === "Medium") return { bg: "bg-amber-50", color: "text-amber-600", border: "border-amber-200" };
    return { bg: "bg-blue-50", color: "text-blue-600", border: "border-blue-200" };
  };

  const stepLabels = ["Upload CSV", "Parse", "Detect Anomalies", "Review", "Import"];
  // Map our internal 3 steps to the 5 visual steps for UI flair
  const visualStep = step === 1 ? 1 : step === 2 ? 4 : 5;

  return (
    <div className="max-w-[1200px] mx-auto py-4 animate-fadeIn">
      
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Import & Anomaly Detection</h2>
        <p className="text-sm text-slate-500">Meera's View</p>
      </div>

      {/* Stepper */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          {stepLabels.map((label, i) => {
            const num = i + 1;
            const isCompleted = visualStep > num;
            const isCurrent = visualStep === num;
            return (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isCompleted ? "bg-[#5b45ff] text-white" : isCurrent ? "bg-[#5b45ff] text-white ring-4 ring-indigo-100" : "bg-slate-100 text-slate-400"
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3" /> : num}
                  </div>
                  <span className={`text-[10px] font-medium ${isCurrent ? "text-[#5b45ff]" : "text-slate-500"}`}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${isCompleted ? "bg-[#5b45ff]" : "bg-slate-200"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl flex gap-3 mb-6 items-center text-sm bg-red-50 text-red-600 border border-red-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" /> <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div className="card p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center border-dashed border-2 border-slate-300">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
            {loading ? <Loader2 className="w-8 h-8 animate-spin text-[#5b45ff]" /> : <Upload className="w-8 h-8 text-[#5b45ff]" />}
          </div>
          <h2 className="text-xl font-bold mb-2 text-slate-800">Upload Expenses CSV</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-sm">
            Select your structured export. Our analyzer will identify duplicates, parse currencies, and validate memberships.
          </p>
          <div className="flex gap-4">
            <label className="btn-primary cursor-pointer">
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" disabled={loading} />
              {loading ? "Analyzing..." : "Select File"}
            </label>
            <button onClick={loadSampleCSV} disabled={loading} className="btn-secondary">
              Load Sample Data
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW ANOMALIES */}
      {step === 2 && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <h3 className="font-bold text-slate-800">CSV parsed successfully</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {draftExpenses.length} rows processed • <span className="font-semibold text-amber-600">{anomalies.length} anomalies detected</span>
              </p>
            </div>
            <button onClick={submitResolutions} disabled={loading} className="btn-primary">
              {loading ? "Finalizing..." : "Review & Continue →"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5 font-semibold text-xs text-slate-500 w-16">Row</th>
                  <th className="py-3 px-5 font-semibold text-xs text-slate-500">Anomaly Type</th>
                  <th className="py-3 px-5 font-semibold text-xs text-slate-500">Description</th>
                  <th className="py-3 px-5 font-semibold text-xs text-slate-500 text-center w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {draftExpenses.map((exp) => {
                  const rowAnoms = exp.anomalies || [];
                  const res = resolutions[exp.rowNumber] || { action: "APPROVE" };
                  if (rowAnoms.length === 0 && res.action === "APPROVE") return null; // Only show anomalies for cleaner UI (SaaS style)

                  return rowAnoms.map((anom, idx) => {
                    const style = getSeverityStyle(anom.severity);
                    return (
                      <tr key={`${exp.rowNumber}-${idx}`} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-5 font-medium text-slate-600">{exp.rowNumber}</td>
                        <td className="py-4 px-5">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.color} border ${style.border}`}>
                            {anom.type || "Anomaly"}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <p className={`text-slate-800 ${res.action === "REJECT" ? "line-through opacity-50" : ""}`}>{anom.description}</p>
                          {res.action === "EDIT" && <p className="text-[10px] text-amber-600 mt-1 font-medium">Pending edits will be applied.</p>}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-center gap-1 border border-slate-200 rounded-lg p-1 bg-white shadow-sm">
                            <button onClick={() => toggleRowAction(exp.rowNumber, "APPROVE")} className={`p-1.5 rounded-md ${res.action === "APPROVE" ? "bg-green-100 text-green-700" : "text-slate-400 hover:bg-slate-100"}`} title="Approve">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => toggleRowAction(exp.rowNumber, "REJECT")} className={`p-1.5 rounded-md ${res.action === "REJECT" ? "bg-red-100 text-red-700" : "text-slate-400 hover:bg-slate-100"}`} title="Reject">
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => startEditing(exp.rowNumber)} className={`p-1.5 rounded-md ${res.action === "EDIT" ? "bg-amber-100 text-amber-700" : "text-slate-400 hover:bg-slate-100"}`} title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
            * Rows without anomalies are automatically approved and hidden from this view to save space.
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingRow && editFormData && (
        <div className="modal-overlay">
          <div className="card max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Edit Row {editingRow}</h3>
              <button onClick={() => { setEditingRow(null); setEditFormData(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs block mb-1 font-semibold text-slate-600">Description</label>
                <input type="text" value={editFormData.description} onChange={(e) => handleEditFieldChange("description", e.target.value)} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs block mb-1 font-semibold text-slate-600">Amount</label>
                  <input type="number" step="any" value={editFormData.amount} onChange={(e) => handleEditFieldChange("amount", parseFloat(e.target.value) || 0)} className="input-field" />
                </div>
                <div>
                  <label className="text-xs block mb-1 font-semibold text-slate-600">Currency</label>
                  <select value={editFormData.currency} onChange={(e) => handleEditFieldChange("currency", e.target.value)} className="input-field">
                    <option value="INR">INR</option><option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs block mb-1 font-semibold text-slate-600">Payer</label>
                  <select value={editFormData.paidBy} onChange={(e) => handleEditFieldChange("paidBy", e.target.value)} className="input-field">
                    {["Aisha","Rohan","Priya","Meera","Sam","Dev"].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs block mb-1 font-semibold text-slate-600">Date</label>
                  <input type="date" value={editFormData.date} onChange={(e) => handleEditFieldChange("date", e.target.value)} className="input-field" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
              <button onClick={() => { setEditingRow(null); setEditFormData(null); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={saveRowEdit} className="btn-primary flex-1">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: REPORT */}
      {step === 3 && (
        <div className="card p-8 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Import Complete</h2>
          <p className="text-sm text-slate-500 mb-8">
            All validated expenses have been ingested into the database.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={onImportComplete} className="btn-secondary">Return to Dashboard</button>
            <button onClick={() => {
              const doc = new jsPDF();
              doc.setFontSize(18); doc.text("Import Action Log", 14, 22);
              doc.setFontSize(11); doc.setTextColor(100); doc.text("Generated by Spreetail App", 14, 30);
              const tableData = importReport.map(item => [`Row ${item.rowNumber}`, item.description, item.actionTaken]);
              doc.autoTable({ startY: 36, head: [["Row", "Description", "Action Taken"]], body: tableData, theme: 'grid', styles: { fontSize: 9 }, headStyles: { fillColor: [91, 69, 255] } });
              doc.save("report.pdf");
            }} className="btn-primary">
              <Download className="w-4 h-4 mr-1" /> Download PDF Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
