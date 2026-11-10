import { rockQueryUrl, parseRockInfo } from './geology.mjs';

export const GEOLOGY_GUIDE = 'https://www.resources.nsw.gov.au/geological-survey/projects/nsw-seamless-geology-project';
export const MINERAL_GUIDE = 'https://geology.utah.gov/map-pub/survey-notes/glad-you-asked/how-do-geologists-identify-minerals/';

export function canQueryContext(context) {
  const point = context?.location;
  const locatedPhoto = context?.source === 'photo' && ['embedded-exif', 'embedded-manual', 'map-pin', 'assigned-current-gps'].includes(point?.source);
  return !!((context?.source === 'camera' || locatedPhoto) && point && Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) && (point.accuracy === null || (Number.isFinite(point.accuracy) && point.accuracy >= 0)) &&
    point.lat >= -37.6 && point.lat <= -28 && point.lng >= 140.9 && point.lng <= 154);
}

// This supplies map context at the phone position. It never classifies the
// camera pixels or transfers a map-unit label to a highlighted object.
export async function loadMappedContext(context, fetcher = fetch, signal) {
  if (!canQueryContext(context)) throw new Error('A captured camera position or an explicitly located photo within mainland NSW is required.');
  const { lat, lng, accuracy } = context.location, url = rockQueryUrl(lat, lng);
  const response = await fetcher(url, { credentials: 'omit', referrerPolicy: 'no-referrer', signal });
  if (!response.ok) throw new Error('Geology service returned HTTP ' + response.status);
  const unit = parseRockInfo(await response.json());
  return {
    type: 'mapped context only', geologicalIdentification: 'unconfirmed',
    queryPosition: { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)), gpsAccuracyM: accuracy },
    locationBasis: context.source === 'camera' ? 'phone position at frame capture; visible feature position unknown'
      : context.location.source === 'embedded-exif' ? 'embedded photo GPS; visible feature position unknown'
        : 'user-assigned photo location; position within the scene unverified',
    positionSource: context.location.source || 'camera-gps',
    publisher: 'Geological Survey of NSW', dataset: 'NSW Seamless Geology · surface rock units',
    queryUrl: url, datasetUrl: GEOLOGY_GUIDE, retrievedAt: new Date().toISOString(),
    unit, sourceMapAccuracy: 'not supplied by this query',
    limit: 'Point query only. Location uncertainty may cross map boundaries. Nearby units, transported material and the visible feature are not identified by this result.'
  };
}
