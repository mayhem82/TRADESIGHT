import {rolldown} from 'rolldown';
const build=await rolldown({input:'public/app.js'});await build.write({file:'public/invisibility-wall-008g.bundle.js',format:'iife',minify:true});await build.close();
