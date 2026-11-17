export const SETTINGS_KEY='mayhem-bottle-bloom-settings-v1';
export const DEFAULTS=Object.freeze({version:1,mode:'bottle',height:.309,bottleWidth:1,startHeight:.012,coveredHeight:0,glassHeight:.14,glassWidth:.08,liquidHeight:.095,surfaceDistance:.45,showGlass:true,glassOpacity:.35,plantSize:1,plantTransparency:0,exposureEV:0,travelExponent:0,growthSpeed:1,cutoffEnabled:true});
const limits={height:[.15,.5],bottleWidth:[.65,1.45],startHeight:[0,.47],coveredHeight:[0,.49],glassHeight:[.08,.25],glassWidth:[.05,.12],liquidHeight:[.01,.245],surfaceDistance:[.1,2],glassOpacity:[.05,1],plantSize:[.1,10],plantTransparency:[0,100],exposureEV:[-2,3],travelExponent:[-3,5],growthSpeed:[.25,4]};
export function sanitizeSettings(value){
 const settings={...DEFAULTS};
 if(!value||typeof value!=='object'||value.version!==1)return settings;
 for(const [key,[min,max]]of Object.entries(limits)){const v=value[key];if(typeof v==='number'&&Number.isFinite(v))settings[key]=Math.min(max,Math.max(min,v));}
 if(['bottle','drink'].includes(value.mode))settings.mode=value.mode;
 for(const key of ['showGlass','cutoffEnabled'])if(typeof value[key]==='boolean')settings[key]=value[key];
 settings.startHeight=Math.min(settings.startHeight,settings.height-.03);
 settings.coveredHeight=Math.min(settings.coveredHeight,settings.height-.01);
 settings.liquidHeight=Math.min(settings.liquidHeight,settings.glassHeight-.005);
 return settings;
}
export function readSettings(){try{return sanitizeSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null'));}catch{return{...DEFAULTS};}}
export function writeSettings(value){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(sanitizeSettings(value)));return true;}catch{return false;}}
