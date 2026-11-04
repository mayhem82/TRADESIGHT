export const samples=[
 {id:'N5-064',name:'Unnamed creek sample N5-064',lat:-30.803094191086,lng:152.4914328205763,ppm:'0.15',observation:'No field observation presented here.',trap:'Moderate–poor',pages:'Appendix 2, pages 9–10'},
 {id:'N5-081',name:'Fishers Creek',lat:-30.75977990456389,lng:152.534019310398,ppm:'2.00',observation:'No visible gold was noted.',trap:'Moderate',pages:'Appendix 2, pages 19–20; main text, printed page 17'},
 {id:'N5-070',name:'Five Day Creek',lat:-30.756008858837156,lng:152.39060545085516,ppm:'2.75',observation:'Eight very fine grains of gold recorded.',trap:'Good–moderate',pages:'Appendix 2, pages 11–12'},
 {id:'N5-069',name:'Lukes Creek',lat:-30.6638097208869,lng:152.41041176556428,ppm:'7.35',observation:'Three fine grains of gold recorded.',trap:'Good',pages:'Appendix 2, pages 11–12; main text, printed page 16'}
].map(r=>({...r,type:'pan-sample',accuracy:null}));
export function sampleSource(id){return 'https://public-gs.geoscience.nsw.gov.au/geoserver/ows?'+new URLSearchParams({service:'WFS',version:'2.0.0',request:'GetFeature',typeNames:'geochemistry:geochemistry_assay_surface',outputFormat:'application/json',resourceID:'geochemistry_assay_surface.10808.'+id});}
