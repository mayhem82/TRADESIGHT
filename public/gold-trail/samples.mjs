import {sampleData} from './research.mjs?v=23';
export const samples=sampleData.map(r=>({...r,id:r.sample_id,name:r.display_name,lat:r.latitude,lng:r.longitude,type:'pan-sample',accuracy:null}));
export function sampleSource(id){return 'https://public-gs.geoscience.nsw.gov.au/geoserver/ows?'+new URLSearchParams({service:'WFS',version:'2.0.0',request:'GetFeature',typeNames:'geochemistry:geochemistry_assay_surface',outputFormat:'application/json',resourceID:'geochemistry_assay_surface.10808.'+id});}
