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

  const runtime = useMemo(() => runTradesight({ input, evidence, project }), [input, evidence, project]);
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
        <div className="badge">Universal operational model</div>
        <h1>TRADESIGHT</h1>
        <p>Construction compliance, defect intelligence, project advocacy, and government-ready assessment infrastructure for NSW.</p>
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

        <EvidencePanel
          evidence={evidence}
          evidenceNote={evidenceNote}
          onEvidenceNoteChange={setEvidenceNote}
          onAddEvidenceNote={addEvidenceNote}
          summary={summary}
        />

        <ReportPreview report={report} assessment={assessment} />
      </section>

      <section className="pathway">
        <h2>Universal Pathway</h2>
        <div className="steps">
          <span>Intake</span>
          <span>Runtime</span>
          <span>Assess</span>
          <span>Evidence</span>
          <span>Agents</span>
          <span>Report</span>
          <span>Project</span>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
