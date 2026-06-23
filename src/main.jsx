import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createAssessmentFromInput } from './lib/create-assessment.js';
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
    const baseAssessment = createAssessmentFromInput(input);
    const risk = riskLevel(baseAssessment.type, input);
    const state = complianceState(baseAssessment.type, input);

    return {
      ...baseAssessment,
      modules: MODULES[baseAssessment.type] || MODULES.unknown,
      risk,
      state
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
          <p><strong>Assessment ID:</strong> {assessment.id}</p>
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
          <ul>{assessment.missingInformation.map((question) => <li key={question}>{question}</li>)}</ul>
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
