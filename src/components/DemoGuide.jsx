import React from 'react';

export function DemoGuide({ loadedDemo, runtime }) {
  const activeTitle = loadedDemo?.title || 'No demo loaded';
  const runtimeStatus = runtime?.status || 'idle';

  return (
    <article className="wide-card demo-guide">
      <div className="panel-heading">
        <div>
          <h2>Demo Walkthrough</h2>
          <p className="muted">Use this sequence when showing TRADESIGHT to a homeowner, builder, council, or NSW-facing stakeholder.</p>
        </div>
        <span className="status-pill">{runtimeStatus}</span>
      </div>
      <dl className="facts compact">
        <div>
          <dt>Loaded case</dt>
          <dd>{activeTitle}</dd>
        </div>
        <div>
          <dt>Runtime events</dt>
          <dd>{runtime?.events?.length || 0}</dd>
        </div>
        <div>
          <dt>Report</dt>
          <dd>{runtime?.report?.type || 'homeowner'}</dd>
        </div>
      </dl>
      <ol className="walkthrough-list">
        <li>Load a demo case.</li>
        <li>Show the intake text in the agent field.</li>
        <li>Point to Runtime Events to show the engine processed the case.</li>
        <li>Review Assessment Object, priority, and evidence completeness.</li>
        <li>Open Evidence Register and show that records remain unverified until checked.</li>
        <li>Use Report Studio to copy or download the draft report text.</li>
        <li>Explain that TRADESIGHT structures the pathway but does not certify the outcome.</li>
      </ol>
    </article>
  );
}
