export function createRuntimeEvent({ stage = 'runtime', status = 'complete', detail = '', data = null } = {}) {
  return {
    id: `RTE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stage,
    status,
    detail,
    data,
    timestamp: new Date().toISOString()
  };
}

export function appendRuntimeEvent(events = [], event = {}) {
  return [...events, createRuntimeEvent(event)];
}
