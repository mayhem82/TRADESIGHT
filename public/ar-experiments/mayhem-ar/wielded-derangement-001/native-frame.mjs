// Explicitly clear the native layer on every frame. Do not depend on a browser
// preserving/discarding its previous colour or depth contents in a certain way.
export function clearNativeLayer(gl,layer){
 if(!layer)return false;
 const colourMask=gl.getParameter(gl.COLOR_WRITEMASK),depthMask=gl.getParameter(gl.DEPTH_WRITEMASK),clearDepth=gl.getParameter(gl.DEPTH_CLEAR_VALUE),scissor=gl.isEnabled(gl.SCISSOR_TEST);
 gl.bindFramebuffer(gl.FRAMEBUFFER,layer.framebuffer);gl.disable(gl.SCISSOR_TEST);gl.colorMask(true,true,true,true);gl.depthMask(true);gl.clearDepth(1);gl.clearColor(0,0,0,0);
 try{gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);}
 finally{gl.colorMask(...colourMask);gl.depthMask(depthMask);gl.clearDepth(clearDepth);if(scissor)gl.enable(gl.SCISSOR_TEST);}
 return true;
}
export function renderNativeFrame(scene,frame,pose,usable,gl,underlay=null){
 scene.startFrame();
 try{const ready=clearNativeLayer(gl,frame.session.renderState.baseLayer);if(ready&&usable&&pose){if(underlay)underlay(frame,pose,frame.session.renderState.baseLayer);scene.drawXRFrame(frame,pose);return true;}return false;}
 finally{scene.endFrame();}
}
