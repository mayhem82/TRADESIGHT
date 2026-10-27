import {rolldown} from 'rolldown';const build=await rolldown({input:'public/app.js'});await build.write({file:'public/single-wall-009.bundle.js',format:'iife',minify:true});await build.close();
