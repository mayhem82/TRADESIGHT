// The camera underlay shares the native renderer's context. Restore bindings
// and capabilities so its state cache cannot leak effects onto model rendering.
export function withCameraState(gl,draw){
 const get=p=>gl.getParameter(p),caps=[gl.BLEND,gl.DEPTH_TEST,gl.CULL_FACE,gl.SCISSOR_TEST],enabled=caps.map(c=>gl.isEnabled(c));
 const saved={program:get(gl.CURRENT_PROGRAM),vao:get(gl.VERTEX_ARRAY_BINDING),array:get(gl.ARRAY_BUFFER_BINDING),active:get(gl.ACTIVE_TEXTURE),readFbo:get(gl.READ_FRAMEBUFFER_BINDING),drawFbo:get(gl.DRAW_FRAMEBUFFER_BINDING),flip:get(gl.UNPACK_FLIP_Y_WEBGL),premultiply:get(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL),viewport:Array.from(get(gl.VIEWPORT)),color:Array.from(get(gl.COLOR_WRITEMASK)),depth:get(gl.DEPTH_WRITEMASK)};
 gl.activeTexture(gl.TEXTURE0);const texture=get(gl.TEXTURE_BINDING_2D),sampler=get(gl.SAMPLER_BINDING);
 try{return draw();}finally{gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.bindSampler(0,sampler);gl.activeTexture(saved.active);gl.bindFramebuffer(gl.READ_FRAMEBUFFER,saved.readFbo);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,saved.drawFbo);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,saved.flip);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,saved.premultiply);gl.viewport(...saved.viewport);gl.colorMask(...saved.color);gl.depthMask(saved.depth);caps.forEach((c,i)=>enabled[i]?gl.enable(c):gl.disable(c));gl.useProgram(saved.program);gl.bindVertexArray(saved.vao);gl.bindBuffer(gl.ARRAY_BUFFER,saved.array);}
}
