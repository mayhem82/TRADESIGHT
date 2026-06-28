import React from 'react';

export function AgentIntake({ input, onInputChange }) {
  return (
    <section className="agent-card">
      <label htmlFor="prompt">What do you want TRADESIGHT to investigate?</label>
      <textarea
        id="prompt"
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder="Example: I want to assess a leaking balcony defect, prepare evidence, and understand the compliant next step."
      />
      <div className="actions">
        <button type="button" disabled title="Upload handling is not active yet">Upload Photos</button>
        <button type="button" disabled title="Plan upload handling is not active yet">Upload Plans</button>
        <button type="button" disabled={!input.trim()} title={input.trim() ? 'Assessment updates automatically from the intake text' : 'Enter an intake request to begin classification'}>
          Start Assessment
        </button>
      </div>
    </section>
  );
}
