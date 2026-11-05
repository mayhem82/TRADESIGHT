import {DataTexture} from './vendor/js/render/core/texture.js';
export class ClipTexture extends DataTexture {
 constructor(playback){super(new Uint8Array([0,0,0,255]),1,1,6408,5121);this.playback=playback;this.mipmap=false;this.sampler.minFilter=9729;this.sampler.magFilter=9729;this.sampler.wrapS=33071;this.sampler.wrapT=33071;}
 updateFrame(gl,handle){this.playback.upload(gl,handle);}
}
