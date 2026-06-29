import React from 'react';
import { DEMO_CASES } from '../demo/demo-cases.js';

export function DemoLoader({ onLoadDemo }) {
  return (
    <article className="wide-card">
      <div className="panel-heading">
        <div>
          <h2>NSW Demo Loader</h2>
          <p className="muted">Choose a prepared case. TRADESIGHT will load intake text, evidence metadata, report audience, runtime events, assessment, and Report Studio output.</p>
        </div>
        <span className="status-pill">demo-ready</span>
      </div>
      <div className="demo-list">
        {DEMO_CASES.map((demoCase) => (
          <section className="subsection demo-case" key={demoCase.id}>
            <div>
              <h3>{demoCase.title}</h3>
              <p><strong>Audience:</strong> {demoCase.audience}</p>
              <p>{demoCase.purpose}</p>
            </div>
            <button type="button" onClick={() => onLoadDemo(demoCase)}>Load Demo</button>
          </section>
        ))}
      </div>
    </article>
  );
}
