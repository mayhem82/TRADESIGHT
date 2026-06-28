import React from 'react';

export function EvidencePanel({ evidence, evidenceNote, onEvidenceNoteChange, onAddEvidenceNote, summary }) {
  return (
    <article>
      <h2>Evidence Register</h2>
      <dl className="facts compact">
        <div>
          <dt>Total</dt>
          <dd>{summary.total}</dd>
        </div>
        <div>
          <dt>Verified</dt>
          <dd>{summary.verified}</dd>
        </div>
        <div>
          <dt>Unverified</dt>
          <dd>{summary.unverified}</dd>
        </div>
      </dl>
      <textarea
        value={evidenceNote}
        onChange={(event) => onEvidenceNoteChange(event.target.value)}
        placeholder="Add evidence note, source, observation, or document reference."
      />
      <div className="actions">
        <button type="button" onClick={onAddEvidenceNote} disabled={!evidenceNote.trim()}>Add Evidence Note</button>
      </div>
      {evidence.length > 0 ? (
        <ul>{evidence.map((item) => <li key={item.id}>{item.id}: {item.description} ({item.status})</li>)}</ul>
      ) : (
        <p className="muted">No evidence records have been added yet.</p>
      )}
    </article>
  );
}
