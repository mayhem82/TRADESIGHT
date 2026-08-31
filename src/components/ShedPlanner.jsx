import React, { useMemo, useState } from 'react';
import { buildShedPlanPathway } from '../shed/shed-review-pathway.js';

const initialForm = {
  widthM: '3',
  lengthM: '4',
  wallHeightM: '2.1',
  roofType: 'skillion',
  claddingType: 'colorbond-steel',
  floorType: 'concrete-slab',
  doorCount: '1',
  windowCount: '0',
  boundaryDistanceM: ''
};

export function ShedPlanner() {
  const [form, setForm] = useState(initialForm);

  const pathway = useMemo(() => buildShedPlanPathway(form), [form]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <article className="wide-card">
      <div className="panel-heading">
        <div>
          <h2>Shed Item List Planner</h2>
          <p>Enter shed dimensions to build a homeowner plan and a materials item list estimate.</p>
        </div>
        <span className="status-pill">Homeowner planning tool</span>
      </div>

      <div className="shed-form-grid">
        <label>
          Width (m)
          <input type="number" min="0" step="0.1" value={form.widthM} onChange={(event) => updateField('widthM', event.target.value)} />
        </label>
        <label>
          Length (m)
          <input type="number" min="0" step="0.1" value={form.lengthM} onChange={(event) => updateField('lengthM', event.target.value)} />
        </label>
        <label>
          Wall height (m)
          <input type="number" min="0" step="0.1" value={form.wallHeightM} onChange={(event) => updateField('wallHeightM', event.target.value)} />
        </label>
        <label>
          Distance to nearest boundary (m)
          <input type="number" min="0" step="0.1" value={form.boundaryDistanceM} onChange={(event) => updateField('boundaryDistanceM', event.target.value)} placeholder="Not entered" />
        </label>
        <label>
          Roof type
          <select value={form.roofType} onChange={(event) => updateField('roofType', event.target.value)}>
            <option value="skillion">Skillion</option>
            <option value="gable">Gable</option>
          </select>
        </label>
        <label>
          Wall cladding
          <select value={form.claddingType} onChange={(event) => updateField('claddingType', event.target.value)}>
            <option value="colorbond-steel">Colorbond steel</option>
            <option value="fibre-cement">Fibre cement</option>
            <option value="timber-weatherboard">Timber weatherboard</option>
          </select>
        </label>
        <label>
          Floor type
          <select value={form.floorType} onChange={(event) => updateField('floorType', event.target.value)}>
            <option value="concrete-slab">Concrete slab</option>
            <option value="bearers-and-joists">Bearers and joists</option>
          </select>
        </label>
        <label>
          Doors
          <input type="number" min="0" step="1" value={form.doorCount} onChange={(event) => updateField('doorCount', event.target.value)} />
        </label>
        <label>
          Windows
          <input type="number" min="0" step="1" value={form.windowCount} onChange={(event) => updateField('windowCount', event.target.value)} />
        </label>
      </div>

      {pathway.missingDetails.length > 0 && (
        <div className="shed-warning">
          <strong>Missing before an item list can be generated:</strong>
          <ul>{pathway.missingDetails.map((detail) => <li key={detail}>{detail}</li>)}</ul>
        </div>
      )}

      {pathway.plan.floorAreaM2 != null && (
        <dl className="facts compact">
          <div><dt>Floor area</dt><dd>{pathway.plan.floorAreaM2} m2</dd></div>
          <div><dt>Roof type</dt><dd>{pathway.plan.roofType}</dd></div>
          <div><dt>Floor type</dt><dd>{pathway.plan.floorType}</dd></div>
        </dl>
      )}

      {pathway.itemList.status === 'estimate' && (
        <div className="shed-item-table-wrap">
          <table className="shed-item-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {pathway.itemList.items.map((item) => (
                <tr key={`${item.category}-${item.item}`}>
                  <td>{item.category}</td>
                  <td>{item.item}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td className="muted">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">{pathway.itemList.note}</p>
        </div>
      )}

      <div className="shed-warning">
        <strong>Development pathway - verify before building:</strong>
        <ul>{pathway.developmentPathwayFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul>
      </div>
    </article>
  );
}
