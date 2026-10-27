import {rolldown} from 'rolldown';const b=await rolldown({input:'public/app.js'});await b.write({file:'public/tv-tabletop-001.bundle.js',format:'iife',minify:true});await b.close();
