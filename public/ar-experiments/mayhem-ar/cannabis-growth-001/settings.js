export const SETTINGS_KEY='mayhem-cannabis-growth-settings-v1';
export const DEFAULTS=Object.freeze({version:1,cultivar:'night-queen',plantSize:1,plantTransparency:0,exposureEV:0,travelExponent:0,growthSpeed:1,startHeight:0,groundMethod:'detected',groundDistance:1.2,cutoffEnabled:true,leafMotion:true,leafMotionStrength:.65,leafCycleSpeed:1});
const limits={plantSize:[.1,10],plantTransparency:[0,100],exposureEV:[-2,3],travelExponent:[-3,5],growthSpeed:[.25,4],startHeight:[-.5,1],groundDistance:[.2,5],leafMotionStrength:[0,1],leafCycleSpeed:[.25,4]};
export function sanitizeSettings(value){
 const result={...DEFAULTS};if(!value||typeof value!=='object'||value.version!==1)return result;
 for(const [key,[min,max]]of Object.entries(limits)){const n=value[key];if(typeof n==='number'&&Number.isFinite(n))result[key]=Math.min(max,Math.max(min,n));}
 if(['night-queen','lemon-kix','blackberry-kush'].includes(value.cultivar))result.cultivar=value.cultivar;
 if(['detected','manual'].includes(value.groundMethod))result.groundMethod=value.groundMethod;
 if(typeof value.cutoffEnabled==='boolean')result.cutoffEnabled=value.cutoffEnabled;
 if(typeof value.leafMotion==='boolean')result.leafMotion=value.leafMotion;
 return result;
}
export function readSettings(){try{return sanitizeSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null'));}catch{return{...DEFAULTS};}}
export function writeSettings(value){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(sanitizeSettings(value)));return true;}catch{return false;}}
