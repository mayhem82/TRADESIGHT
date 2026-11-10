import { validPhotoLocation, locationLabel } from './photo-metadata.mjs';

export function setupPhotoMap({ L, mainMap, showPhoto }) {
  const $ = id => document.getElementById(id), dialog = $('photoMapDialog');
  const picker = L.map('photoLocationMap', { zoomControl: true }).setView([-30.818226, 152.508343], 12);
  const pins = L.layerGroup().addTo(mainMap);
  const icon = () => L.divIcon({ className: 'photo-map-pin', html: '<span aria-hidden="true">▣</span>', iconSize: [28, 28] });
  let resolvePick = null, marker = null, point = null, street = null, preview = null;
  function setPoint(lat, lng) {
    if (!validPhotoLocation({ lat, lng })) { $('photoPinStatus').textContent = 'Enter latitude −90 to 90 and longitude −180 to 180.'; $('photoPinConfirm').disabled = true; return; }
    point = { lat, lng, accuracy: null, source: 'map-pin', datum: 'WGS-84', assignedAt: new Date().toISOString() };
    $('photoPinLat').value = lat.toFixed(6); $('photoPinLng').value = lng.toFixed(6);
    if (!marker) marker = L.marker([lat, lng], { draggable: true, icon: icon() }).addTo(picker).on('dragend', () => { const p = marker.getLatLng(); setPoint(p.lat, p.lng); });
    else marker.setLatLng([lat, lng]);
    $('photoPinConfirm').disabled = false; $('photoPinStatus').textContent = locationLabel(point);
  }
  picker.on('click', event => setPoint(event.latlng.lat, event.latlng.lng));
  $('photoPinCentre').onclick = () => { const p = picker.getCenter(); setPoint(p.lat, p.lng); };
  $('photoPinCoordinates').onclick = () => {
    const lat = $('photoPinLat').value.trim(), lng = $('photoPinLng').value.trim();
    if (!lat || !lng) { $('photoPinStatus').textContent = 'Enter both latitude and longitude.'; return; }
    setPoint(Number(lat), Number(lng)); if (!$('photoPinConfirm').disabled) picker.panTo([point.lat, point.lng]);
  };
  $('photoPinTiles').onclick = () => {
    if (street) { picker.removeLayer(street); street = null; $('photoPinTiles').textContent = 'Enable street map'; }
    else { street = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(picker); $('photoPinTiles').textContent = 'Hide street map'; }
  };
  function finish(value) { const done = resolvePick; resolvePick = null; dialog.close(); done?.(value); }
  $('photoPinConfirm').onclick = () => { if (point && !$('photoPinConfirm').disabled) finish({ ...point }); };
  $('photoPinCancel').onclick = () => finish(null);
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(null); });
  dialog.addEventListener('close', () => { if (resolvePick) { const done = resolvePick; resolvePick = null; done(null); } });
  return {
    cancel: () => { if (resolvePick) finish(null); },
    pick(location) {
      if (resolvePick) finish(null);
      point = null; if (marker) { picker.removeLayer(marker); marker = null; }
      $('photoPinLat').value = ''; $('photoPinLng').value = ''; $('photoPinConfirm').disabled = true;
      $('photoPinStatus').textContent = 'Tap the map, position the map centre, or enter coordinates, then confirm.';
      const initial = validPhotoLocation(location) ? location : mainMap.getCenter();
      picker.setView([initial.lat, initial.lng], validPhotoLocation(location) ? 16 : mainMap.getZoom());
      dialog.showModal(); requestAnimationFrame(() => picker.invalidateSize());
      // Existing location can be reviewed, but only an explicit action assigns a new pin.
      if (validPhotoLocation(location)) { marker = L.marker([location.lat, location.lng], { draggable: true, icon: icon() }).addTo(picker).on('dragend', () => { const p = marker.getLatLng(); setPoint(p.lat, p.lng); }); }
      return new Promise(resolve => { resolvePick = resolve; });
    },
    refresh(records) {
      if (preview) { mainMap.removeLayer(preview); preview = null; }
      pins.clearLayers();
      for (const record of records.filter(record => validPhotoLocation(record.location))) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Open photo: ' + record.name;
        button.onclick = () => showPhoto(record.id);
        const detail = document.createElement('div'), label = document.createElement('p');
        label.textContent = locationLabel(record.location); detail.append(button, label);
        L.marker([record.location.lat, record.location.lng], {
          title: 'Photo: ' + record.name,
          icon: icon()
        }).addTo(pins).bindPopup(detail);
      }
    },
    show(location) {
      if (!validPhotoLocation(location)) return;
      if (preview) { mainMap.removeLayer(preview); preview = null; }
      const saved = pins.getLayers().some(pin => {
        const p = pin.getLatLng(); return Math.abs(p.lat - location.lat) < 1e-9 && Math.abs(p.lng - location.lng) < 1e-9;
      });
      if (!saved) {
        const label = document.createElement('p'); label.textContent = 'Photo location preview · ' + locationLabel(location);
        preview = L.marker([location.lat, location.lng], { title: 'Photo location preview', icon: icon() }).addTo(mainMap).bindPopup(label);
      }
      mainMap.setView([location.lat, location.lng], Math.max(mainMap.getZoom(), 16));
      $('map').scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  };
}
