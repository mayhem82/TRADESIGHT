import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { appendEvidence, createEvidenceRegister } from './lib/evidence-register.js';
import { loadProject, saveProject, clearProject } from './lib/project-storage.js';
import { runTradesight } from './runtime/run-tradesight.js';
import { AgentIntake } from './components/AgentIntake.jsx';
import { AssessmentPanel } from './components/AssessmentPanel.jsx';
import { EvidencePanel } from './components/EvidencePanel.jsx';
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
        <div className="badge">Live operational app</div>
        <h1>TRADESIGHT</h1>
        <p>Ask a construction question, start an assessment, capture evidence, and generate a structured report.</p>
      </section>

      <section className="entry-grid">
        <article>
          <h2>Ask a Question</h2>
          <p>Use TRADESIGHT without creating a project first. If the issue grows, save it as a project.</p>
        </article>
        <article>
          <h2>Upload Plans</h2>
          <p>Plan upload handling is the next operational capability to build.</p>
        </article>
        <article>
          <h2>Upload Photos</h2>
          <p>Photo evidence handling is the next operational capability to build.</p>
        </article>
        <article>
          <h2>Look Up Standards</h2>
          <p>Standards lookup must be evidence-linked and source-controlled before conclusions are asserted.</p>
        </article>
      </section>

      <AgentIntake input={input} onInputChange={setInput} />

      <section className="grid">
        <ProjectPanel project={currentProject} onSave={handleSaveProject} onClear={handleClearProject} />
        <AssessmentPanel assessment={assessment} />

        <article>
          <h2>Runtime Events</h2>
          <ul>{runtime.events.map((event) => <li key={event.id}>{event.stage}: {event.detail}</li>)}</ul>
        </article>

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
        <h2>Operational Pathway</h2>
        <div className="steps">
          <span>Question</span>
          <span>Runtime</span>
          <span>Assessment</span>
          <span>Evidence</span>
          <span>Standards</span>
          <span>Report</span>
          <span>Project</span>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
