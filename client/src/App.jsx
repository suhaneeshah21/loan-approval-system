import { useState } from "react";

const INITIAL_FORM = {
  no_of_dependents: 0,
  education: 1,
  self_employed: 0,
  income_annum: "",
  loan_amount: "",
  loan_term: "",
  cibil_score: 800,
  residential_assets_value: "",
  commercial_assets_value: "",
  luxury_assets_value: "",
  bank_asset_value: "",
};

function parseSection(text, label) {
  const regex = new RegExp(label + "[:\\s]*([\\s\\S]*?)(?=\\n[A-Z ]{3,}:|$)", "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function ShapBar({ name, value }) {
  const isPos = value > 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "0.5px solid #e5e5e5" }}>
      <span style={{ flex: 1, fontSize: 13, textTransform: "capitalize" }}>
        {name.replace(/_/g, " ")}
      </span>
      <div style={{ flex: 2, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${Math.min(Math.abs(value) * 10, 100)}%`,
            background: isPos ? "#639922" : "#e24b4a",
            borderRadius: 3,
          }}
        />
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, minWidth: 40, textAlign: "right", color: isPos ? "#3b6d11" : "#a32d2d" }}>
        {isPos ? "+" : ""}{value.toFixed(2)}
      </span>
    </div>
  );
}

function ResultSection({ label, children }) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "1.25rem", marginBottom: "0.75rem" }}>
      <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#888", marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setResult(null);

    if (!form.income_annum || !form.loan_amount || !form.loan_term) {
      setError("Please fill in annual income, loan amount, and loan term.");
      return;
    }

    const payload = {
      no_of_dependents: parseInt(form.no_of_dependents),
      education: parseInt(form.education),
      self_employed: parseInt(form.self_employed),
      income_annum: parseFloat(form.income_annum),
      loan_amount: parseFloat(form.loan_amount),
      loan_term: parseInt(form.loan_term),
      cibil_score: parseInt(form.cibil_score),
      residential_assets_value: parseFloat(form.residential_assets_value) || 0,
      commercial_assets_value: parseFloat(form.commercial_assets_value) || 0,
      luxury_assets_value: parseFloat(form.luxury_assets_value) || 0,
      bank_asset_value: parseFloat(form.bank_asset_value) || 0,
    };

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Could not connect to backend. Make sure uvicorn is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const approved = result?.prediction === 1;
  const llm = result?.llm_response || "";
  const summary = parseSection(llm, "PROFILE SUMMARY");
  const reason = parseSection(llm, "DECISION REASON");
  const suggestions = parseSection(llm, approved ? "TIPS" : "SUGGESTIONS");

  const styles = {
    page: { maxWidth: 780, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" },
    header: { textAlign: "center", marginBottom: "2.5rem", paddingBottom: "1.5rem", borderBottom: "0.5px solid #e5e5e5" },
    badge: { display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#185fa5", background: "#e6f1fb", padding: "4px 12px", borderRadius: 8, marginBottom: "0.75rem" },
    h1: { fontSize: 22, fontWeight: 500, marginBottom: "0.4rem" },
    subtitle: { fontSize: 14, color: "#888" },
    card: { background: "#c4c4c4", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "1.5rem", marginBottom: "1.25rem" },
    sectionTitle: { fontSize: 13, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "0.5px solid #e5e5e5" },
    formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" },
    formGroup: { display: "flex", flexDirection: "column", gap: 6 },
    label: { fontSize: 13, color: "#555", fontWeight: 500 },
    input: { fontSize: 14, padding: "8px 10px", border: "0.5px solid #ccc", borderRadius: 8, background: "#e8e8e8", color: "#111", width: "100%" ,boxSizing: "border-box"},
    hint: { fontSize: 11, color: "#aaa" },
    submitBtn: { width: "100%", padding: 12, fontSize: 15, fontWeight: 500, background: "#c4c4c4",color: "#555", border: "0.5px solid #ccc", borderRadius: 8, cursor: "pointer", marginTop: "0.5rem" },
    errorMsg: { background: "#fcebeb", border: "0.5px solid #f09595", color: "#a32d2d", borderRadius: 8, padding: "12px 16px", fontSize: 14, marginBottom: "1rem", marginTop: "1rem" },
    loading: { textAlign: "center", padding: "2rem", color: "#888", fontSize: 14 },
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.badge}>AI-Powered</div>
        <h1 style={styles.h1}>Loan Eligibility Checker</h1>
        <p style={styles.subtitle}>Fill in your details to check your loan approval status instantly</p>
      </div>

      {/* Personal Info */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>Personal information</div>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Number of dependents</label>
            <input style={styles.input} type="number" name="no_of_dependents" min="0" max="10" value={form.no_of_dependents} onChange={handleChange} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Education</label>
            <select style={styles.input} name="education" value={form.education} onChange={handleChange}>
              <option value={1}>Graduate</option>
              <option value={0}>Not Graduate</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Self employed</label>
            <select style={styles.input} name="self_employed" value={form.self_employed} onChange={handleChange}>
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Annual income (₹)</label>
            <input style={styles.input} type="number" name="income_annum" placeholder="e.g. 900000" value={form.income_annum} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* Loan Details */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>Loan details</div>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Loan amount (₹)</label>
            <input style={styles.input} type="number" name="loan_amount" placeholder="e.g. 2000000" value={form.loan_amount} onChange={handleChange} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Loan term (years)</label>
            <input style={styles.input} type="number" name="loan_term" min="1" max="30" placeholder="e.g. 10" value={form.loan_term} onChange={handleChange} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>CIBIL score range</label>
            <select style={styles.input} name="cibil_score" value={form.cibil_score} onChange={handleChange}>
              <option value={400}>Poor (300–549)</option>
              <option value={600}>Fair (550–649)</option>
              <option value={700}>Good (650–749)</option>
              <option value={800}>Excellent (750–900)</option>
            </select>
            <span style={styles.hint}>Check free on CRED or BankBazaar</span>
          </div>
        </div>
      </div>

      {/* Assets */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>Assets (₹)</div>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Residential assets</label>
            <input style={styles.input} type="number" name="residential_assets_value" placeholder="e.g. 3000000" value={form.residential_assets_value} onChange={handleChange} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Commercial assets</label>
            <input style={styles.input} type="number" name="commercial_assets_value" placeholder="e.g. 500000" value={form.commercial_assets_value} onChange={handleChange} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Luxury assets</label>
            <input style={styles.input} type="number" name="luxury_assets_value" placeholder="e.g. 200000" value={form.luxury_assets_value} onChange={handleChange} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Bank asset value</label>
            <input style={styles.input} type="number" name="bank_asset_value" placeholder="e.g. 400000" value={form.bank_asset_value} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
        {loading ? "Analyzing..." : "Check eligibility"}
      </button>

      {/* Error */}
      {error && <div style={styles.errorMsg}>{error}</div>}

      {/* Loading */}
      {loading && <div style={styles.loading}>Analyzing your profile, please wait...</div>}

      {/* Results */}
      {result && (
        <div style={{ marginTop: "1.5rem" }}>

          {/* Verdict */}
          <div style={{
            background: approved ? "#eaf3de" : "#fcebeb",
            border: `0.5px solid ${approved ? "#c0dd97" : "#f7c1c1"}`,
            borderRadius: 12, padding: "1.5rem", marginBottom: "1rem",
            display: "flex", alignItems: "center", gap: 12
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: approved ? "#c0dd97" : "#f7c1c1",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 500,
              color: approved ? "#3b6d11" : "#a32d2d"
            }}>
              {approved ? "✓" : "✕"}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 500, color: approved ? "#3b6d11" : "#a32d2d" }}>
                {approved ? "Loan Approved" : "Loan Rejected"}
              </div>
              <div style={{ fontSize: 13, color: "#888" }}>
                {approved
                  ? "Congratulations! Your application meets the criteria."
                  : "Your application did not meet the required criteria."}
              </div>
            </div>
          </div>

          {/* Profile Summary */}
          {summary && (
            <ResultSection label="Profile summary">
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{summary}</p>
            </ResultSection>
          )}

          {/* Decision Reason */}
          {reason && (
            <ResultSection label="Decision reason">
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{reason}</p>
            </ResultSection>
          )}

          {/* SHAP Bars */}
          <ResultSection label="Key factors">
            {Object.entries(result.shap_explanation).map(([key, val]) => (
              <ShapBar key={key} name={key} value={val} />
            ))}
          </ResultSection>

          {/* Suggestions or Tips */}
          {suggestions && (
            <ResultSection label={approved ? "Tips to maintain standing" : "How to improve your chances"}>
              <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-line", margin: 0 }}>{suggestions}</p>
            </ResultSection>
          )}

        </div>
      )}
    </div>
  );
}
