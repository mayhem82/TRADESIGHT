import React, { useState } from 'react';

export function FreeCadStudio() {
  const [address, setAddress] = useState(() => localStorage.getItem('tradesight-cad-address') || 'http://127.0.0.1:8766');
  const [error, setError] = useState('');
  function open() {
    try {
      const url = new URL(address);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error();
      localStorage.setItem('tradesight-cad-address', url.origin);
      window.open(url.origin, '_blank', 'noopener,noreferrer');
      setError('');
    } catch { setError('Enter the HTTPS address printed by Start-CAD.ps1, or the local PC address.'); }
  }
  return <article>
    <h2>FreeCAD Site Studio</h2>
    <p>Trace site photographs, enter dimensions or import an existing FreeCAD model. Generate editable CAD, plans, elevations, sections, supplied service schematics and an offline interactive model.</p>
    <label htmlFor="cad-address">PC CAD service address</label>
    <input id="cad-address" type="url" value={address} onChange={e => setAddress(e.target.value)} placeholder="https://your-pc.ts.net:9443" />
    <button onClick={open}>Open Site CAD</button>
    {error && <p role="alert">{error}</p>}
    <p>Start cad-site/Start-CAD.ps1 on your PC. For access on mobile data use -Remote and connect Tailscale on both devices. A ChatGPT project folder or GitHub Pages alone cannot run FreeCAD.</p>
  </article>;
}
