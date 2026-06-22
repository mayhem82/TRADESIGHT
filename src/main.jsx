import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const MODULES = {
  compliance: ['Compliance Engine', 'Compliance Summary Generator'],
  defect: ['Image DNA / As-Built Scanner', "Builder's Advocate", 'Compliance Engine', 'Evidence Pack Builder'],
  plan: ['Plan Correction Engine', 'Compliance Engine', "Engineer's Advocate"],
  dispute: ["Builder's Advocate", 'Evidence Pack Builder', 'Compliance Summary Generator'],
  materials: ['Materials & Specification Engine', 'Compliance Engine'],
  safety: ['Hazard Prediction Engine', 'Compliance Engine'],
  government: ['Governance Assessment Layer', 'Evidence Pack Builder', 'Compliance Summary Generator'],
  unknown: ['TRADESIGHT Agent', 'Clarification Intake']
};

const QUESTIONS = {
  compliance: ['Location', 'Building class if known', 'Description of proposed work', 'Who will perform the work', 'Photos, plans, or measurements'],
  defect: ['Photos of the defect', 'When the defect appeared', 'Who performed the work', 'Contract, quote, invoice, or report', 'Current safety risk'],
  plan: ['Plan, sketch, or drawing', 'Site location', 'Building class if known', 'Intended work', 'Known council or certifier requirements'],
  dispute: ['What happened', 'Who is involved', 'Timeline', 'Contract or written agreement', 'Photos, invoices, reports, or messages'],
  materials: ['Material or product name', 'Application area', 'Exposure conditions', 'Manufacturer datasheet', 'Relevant measurements'],
  safety: ['Hazard description', 'Location', 'Photos', 'Who may be exposed', 'Urgency'],
  government: ['Responsible body', 'Decision or failure being reviewed', 'Timeline', 'Rules or policy involved', 'Evidence already held'],
  unknown: ['Describe the issue in plain language', 'Location', 'Photos or files', 'What outcome is needed']
};

function detectType(input) {
  const text = input.toLowerCase();
  if (/defect|crack|leak|mould|rot|failed|damage|unsafe|non[- ]?compliant/.test(text)) return 'defect';
  if (/plan|drawing|sketch|approval|da|cdc|certifier|layout/.test(text)) return 'plan';
  if (/builder|dispute|quote|contract|invoice|variation|warranty|tribunal|fair trading/i.test(text)) return 'dispute';
  if (/material|product|sheet|spec|cladding|membrane|waterproof|timber|concrete|steel/.test(text)) return 'materials';
  if (/hazard|risk|fall|asbestos|excavation|ladder|site safety|whs/.test(text)) return 'safety';
  if (/council|government|regulator|policy|procurement|compliance program|audit|agency/.test(text)) return 'government';
  if (/comply|compliance|standard|ncc|nsw|licen[cs]e|legal|allowed/.test(text)) return 'compliance';
  return 'unknown';
}

function riskLevel(type, input) {
  const text = input.toLowerCase();
  if (/licensed|certified|structural|asbestos|fire|collapse|load bearing/.test(text)) return 'High';
  if (['defect', 'safety', 'dispute'].includes(type)) return 'Medium';
  if (type === 'unknown') return 'Unclassified';
  return 'Low to Medium';
}

function complianceState(type, input) {
  const text = input.toLowerCase();
  if (/licensed|certified|restricted|load bearing/.test(text)) return 'CS2 — Requires Licensed Practitioner Only likely';
  if (type === 'unknown') return 'CS7 — Unknown / Cannot Assume Under NSW Law';
  return 'CS7 — Pending validation';
}

function App() {
  const [input, setInput] = useState('');
  const assessment = useMemo(() => {
    const type = detectType(input);
    return {
      type,
      modules: MODULES[type],
      questions: QUESTIONS[type],
      risk: riskLevel(type, input),
      state: complianceState(type, input)
    };
  }, [input]);

  return (
    <main className="shell">
      <section className="hero">
        <div className="badge">Universal operational model</div>
        <h1>TRADESIGHT</h1>
        <p>Construction compliance, defect intelligence, project advocacy, and government-ready assessment infrastructure for NSW.</p>
      </section>

      <section className="agent-card">
        <label htmlFor="prompt">What do you want TRADESIGHT to investigate?</label>
        <textarea
          id="prompt"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Example: I want to assess a leaking balcony defect, prepare evidence, and understand the compliant next step."
        />
        <div className="actions">
          <button type="button">Upload Photos</button>
          <button type="button">Upload Plans</button>
          <button type="button">Start Assessment</button>
        </div>
      </section>

      <section className="grid">
        <article>
          <h2>Assessment Object</h2>
          <p><strong>Detected type:</strong> {assessment.type}</p>
          <p><strong>Compliance state:</strong> {assessment.state}</p>
          <p><strong>Risk classification:</strong> {assessment.risk}</p>
        </article>

        <article>
          <h2>Module Routing</h2>
          <ul>{assessment.modules.map((module) => <li key={module}>{module}</li>)}</ul>
        </article>

        <article>
          <h2>Missing Information</h2>
          <ul>{assessment.questions.map((question) => <li key={question}>{question}</li>)}</ul>
        </article>

        <article>
          <h2>Audit Position</h2>
          <p>TRADESIGHT does not invent law, standards, or approvals. Unknown items remain unknown until validated. Restricted work is routed away from unsafe instruction.</p>
        </article>
      </section>

      <section className="pathway">
        <h2>Universal Pathway</h2>
        <div className="steps">
          <span>Intake</span>
          <span>Classify</span>
          <span>Route</span>
          <span>Assess</span>
          <span>Evidence</span>
          <span>Report</span>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
