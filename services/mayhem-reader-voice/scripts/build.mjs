import {mkdirSync,copyFileSync,cpSync} from 'node:fs';
import {build} from 'esbuild';
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
// The official SDK's CommonJS barrel eagerly loads every ElevenLabs resource,
// exceeding the hosted Worker's startup CPU limit. Restrict the TTS client's
// two barrel imports to the official serializers and error it actually uses.
// We still bundle the unmodified official TextToSpeechClient implementation.
const clientPath=/[\\/]api[\\/]resources[\\/]textToSpeech[\\/]client[\\/]Client\.js$/;
const sdkPrune={name:'elevenlabs-tts-only',setup(b){
 b.onResolve({filter:/^\.\.\/\.\.\/\.\.\/\.\.\/serialization\/index$/},a=>clientPath.test(a.importer)?{path:'serialization',namespace:'tts-only'}:null);
 b.onResolve({filter:/^\.\.\/\.\.\/\.\.\/index$/},a=>clientPath.test(a.importer)?{path:'api',namespace:'tts-only'}:null);
 b.onLoad({filter:/^serialization$/,namespace:'tts-only'},()=>({resolveDir:process.cwd(),loader:'js',contents:[
  "export {BodyTextToSpeechFullWithTimestamps} from '@elevenlabs/elevenlabs-js/serialization/resources/textToSpeech/client/requests/BodyTextToSpeechFullWithTimestamps.js';",
  "export {TextToSpeechConvertWithTimestampsRequestOutputFormat} from '@elevenlabs/elevenlabs-js/serialization/resources/textToSpeech/types/TextToSpeechConvertWithTimestampsRequestOutputFormat.js';",
  "export {AudioWithTimestampsResponse} from '@elevenlabs/elevenlabs-js/serialization/types/AudioWithTimestampsResponse.js';"
 ].join('\n')}));
 b.onLoad({filter:/^api$/,namespace:'tts-only'},()=>({resolveDir:process.cwd(),loader:'js',contents:"export {UnprocessableEntityError} from '@elevenlabs/elevenlabs-js/api/errors/UnprocessableEntityError.js';"}));
}};
await build({entryPoints:['worker/index.js'],outfile:'dist/server/index.js',bundle:true,minify:true,format:'esm',platform:'browser',target:'es2022',logLevel:'warning',plugins:[sdkPrune]});
copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
