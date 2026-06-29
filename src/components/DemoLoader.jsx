import React from 'react';
import { DEMO_CASES } from '../demo/demo-cases.js';

export function DemoLoader({ onLoadDemo }) {
  return (
    <article className="wide-card">
      <div className="panel-heading">
        <div>
          <h2>NSW Demo Loader</h2>
          <p className="muted">Load a prepared demo case into the same runtime used by normal intake.</p>
        </div>
      </div>
      <div className="demo-list">
        {DEMO_CASES.map((demoCase) => (
          <section className="subsection" key={demoCase.id}>
            <h3>{demoCase.title}</h3>
            <p><strong>Audience:</strong> {demoCase.audience}</p>
            <p>{demoCase.purpose}</p>
            <button type="button" onClick={() => onLoadDemo(demoCase)}>Load Demo</button>
          </section>
        ))}
      </div>
    </article>
  );
}
