import React from 'react';

export function AgentRouterPanel({ route }) {
  if (!route) return null;

  return (
    <article>
      <h2>Agent Router</h2>
      <dl className="facts compact">
        <div>
          <dt>Route</dt>
          <dd>{route.routeType}</dd>
        </div>
        <div>
          <dt>Task</dt>
          <dd>{route.taskType}</dd>
        </div>
        <div>
          <dt>Project required</dt>
          <dd>{route.projectRequired ? 'yes' : 'no'}</dd>
        </div>
      </dl>
      <p><strong>Primary agent:</strong> {route.primaryAgent}</p>
      <h3>Agents selected</h3>
      <ul>{route.agentNames.map((agentName) => <li key={agentName}>{agentName}</li>)}</ul>
      <h3>Next required actions</h3>
      <ul>{route.requiredNextActions.map((action) => <li key={action}>{action}</li>)}</ul>
      <p className="muted">{route.boundary}</p>
    </article>
  );
}
