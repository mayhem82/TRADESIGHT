import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createAssessmentFromInput } from './lib/create-assessment.js';
import { createEvidenceRegister, appendEvidence, evidenceSummary } from './lib/evidence-register.js';
import { generateReport, reportToText } from './lib/generate-report.js';
import { loadProject, saveProject, clearProject } from './lib/project-storage.js';
import { ProjectPanel } from './components/ProjectPanel.jsx';
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
  const [project, setProject] = useState(() => loadProject());
  const [evidence, setEvidence] = useState(() => createEvidenceRegister(project.evidence));
  const [evidenceNote, setEvidenceNote] = useState('');

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

  const summary = useMemo(() => evidenceSummary(evidence), [evidence]);
  const report = useMemo(() => generateReport({ assessment, evidence }), [assessment, evidence]);
  const currentProject = useMemo(() => ({
    ...project,
    assessments: input.trim() ? [assessment] : project.assessments,
    evidence
  }), [project, input, assessment, evidence]);

  function addEvidenceNote() {
    if (!evidenceNote.trim()) return;
    setEvidence((current) => appendEvidence(current, {
      source: 'user-note',
      description: evidenceNote.trim(),
      status: 'unverified'
    }));
    setEvidenceNote('');
  }

  function handleSaveProject() {
    const saved = saveProject(currentProject);
    setProject(saved);
  }

  function handleClearProject() {
    const cleared = clearProject();
    setProject(cleared);
    setEvidence(createEvidenceRegister());
    setInput('');
  }

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
        <ProjectPanel project={currentProject} onSave={handleSaveProject} onClear={handleClearProject} />

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
          <h2>Evidence Register</h2>
          <p><strong>Total:</strong> {summary.total}</p>
          <p><strong>Verified:</strong> {summary.verified}</p>
          <p><strong>Unverified:</strong> {summary.unverified}</p>
          <textarea
            value={evidenceNote}
            onChange={(event) => setEvidenceNote(event.target.value)}
            placeholder="Add evidence note, source, observation, or document reference."
          />
          <div className="actions">
            <button type="button" onClick={addEvidenceNote}>Add Evidence Note</button>
          </div>
          <ul>{evidence.map((item) => <li key={item.id}>{item.id}: {item.description} ({item.status})</li>)}</ul>
        </article>

        <article className="wide-card">
          <h2>Report Preview</h2>
          <pre>{reportToText(report)}</pre>
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
