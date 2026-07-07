import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { appendEvidence, createEvidenceRegister } from './lib/evidence-register.js';
import { loadProject, saveProject, clearProject } from './lib/project-storage.js';
import { runTradesight } from './runtime/run-tradesight.js';
import { AgentIntake } from './components/AgentIntake.jsx';
import { AgentRouterPanel } from './components/AgentRouterPanel.jsx';
import { AssessmentPanel } from './components/AssessmentPanel.jsx';
import { EvidencePanel } from './components/EvidencePanel.jsx';
import { PhoneScanWorkflow } from './components/PhoneScanWorkflow.jsx';
import { ProjectPanel } from './components/ProjectPanel.jsx';
import { ReportPreview } from './components/ReportPreview.jsx';
import { getModulesForTask } from './modules/registry.js';
import './styles.css';

function App() {
  const [input, setInput] = useState('');
  const [project, setProject] = useState(() => loadProject());
  const [evidence, setEvidence] = useState(() => createEvidenceRegister(project.evidence));
  const [evidenceNote, setEvidenceNote] = useState('');
  const [reportType] = useState('homeowner');

  const runtime = useMemo(() => runTradesight({ input, evidence, project, reportType }), [input, evidence, project, reportType]);
  const assessment = useMemo(() => ({
    ...runtime.assessment,
    modules: getModulesForTask(runtime.assessment?.type)
  }), [runtime.assessment]);
  const summary = runtime.evidenceSummary;
  const report = runtime.report;
  const currentProject = runtime.project;

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
        <div className="badge">Agent-first live app</div>
        <h1>TRADESIGHT</h1>
        <p>Ask once. TRADESIGHT routes the work through agents for questions, plans, photos, standards, evidence, assessment, report, or project record.</p>
      </section>

      <AgentIntake input={input} onInputChange={setInput} />

      <section className="grid">
        <AgentRouterPanel route={runtime.intakeRoute} />
        <ProjectPanel project={currentProject} onSave={handleSaveProject} onClear={handleClearProject} />
        <AssessmentPanel assessment={assessment} />

        <article>
          <h2>Runtime Events</h2>
          <ul>{runtime.events.map((event) => <li key={event.id}>{event.stage}: {event.detail}</li>)}</ul>
        </article>

        <PhoneScanWorkflow />

        <article>
          <h2>Module Routing</h2>
          <ul>{assessment.modules.map((module) => <li key={module.id}>{module.name} - {module.status}</li>)}</ul>
        </article>

        <article>
          <h2>Missing Information</h2>
          <ul>{assessment.missingInformation.map((question) => <li key={question}>{question}</li>)}</ul>
        </article>

        <EvidencePanel evidence={evidence} evidenceNote={evidenceNote} onEvidenceNoteChange={setEvidenceNote} onAddEvidenceNote={addEvidenceNote} summary={summary} />
        <ReportPreview report={report} assessment={assessment} />
      </section>

      <section className="pathway">
        <h2>Agent-Controlled Pathway</h2>
        <div className="steps">
          <span>User input</span>
          <span>Agent router</span>
          <span>Specialist agents</span>
          <span>Required questions</span>
          <span>Evidence</span>
          <span>Standards</span>
          <span>3D scan intake</span>
          <span>Report or project</span>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
