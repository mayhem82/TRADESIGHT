import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createAssessmentFromInput } from './lib/create-assessment.js';
import { createEvidenceRegister, appendEvidence, evidenceSummary } from './lib/evidence-register.js';
import { generateReport } from './lib/generate-report.js';
import { loadProject, saveProject, clearProject } from './lib/project-storage.js';
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

  const summary = useMemo(() => evidenceSummary(evidence), [evidence]);

  const assessment = useMemo(() => {
    const baseAssessment = createAssessmentFromInput(input, { evidenceSummary: summary });

    return {
      ...baseAssessment,
      modules: getModulesForTask(baseAssessment.type)
    };
  }, [input, summary]);

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

      <AgentIntake input={input} onInputChange={setInput} />

      <section className="grid">
        <ProjectPanel project={currentProject} onSave={handleSaveProject} onClear={handleClearProject} />
        <AssessmentPanel assessment={assessment} />

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
