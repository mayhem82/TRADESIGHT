// Adapted from Julian's verified Sound Nebula CV shader.
// See ar-source/wielded-derangement-001/NEBULA-SOURCE-PROVENANCE.json.
export const CAMERA_VERTEX=`#version 300 es

    in vec2 aPos;
    out mediump vec2 vUv;
    out mediump vec2 layerUv;
    uniform float uRotate180;
    uniform float uFlipY;
    uniform vec2 uUvScale;
    uniform vec2 uUvOffset;
    void main() {
      vec2 uv = aPos * 0.5 + 0.5;layerUv=uv;
      uv = uv * uUvScale + uUvOffset;
      if(uFlipY>.5)uv.y=1.0-uv.y;
      vUv = uRotate180 > 0.5 ? (1.0 - uv) : uv;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;
export const CAMERA_FRAGMENT=`#version 300 es

    precision mediump float;
    out vec4 cameraColor;
    in mediump vec2 vUv;
    in mediump vec2 layerUv;
    uniform sampler2D uNebula;
    uniform float uNebulaEnabled;
    uniform float uCameraAvailable;
    uniform vec3 uFlashColor;
    uniform float uFlashAlpha;
    uniform float uFlashBlack;
    uniform float uBlackout;
    uniform sampler2D uTex;
    uniform float uBlend;
    uniform float uOutlineEnabled;
    uniform float uOutlineThickness;
    uniform float uOutlineBlend;
    uniform float uOutlineOpacity;
    uniform vec3 uOutlineColor;
    uniform float uCartoonEnabled;
    uniform float uCartoonLevels;
    uniform float uCartoonEdgeThickness;
    uniform float uCartoonEdgeStrength;
    uniform float uCartoonSaturation;
    uniform vec2 uTexelSize;
    uniform float uSpread;
    uniform int uPointCount;
    uniform vec3 uSourceLab[32];
    uniform vec3 uCorrection[32];   // hueShift(deg), satAdjust, lightAdjust
    uniform vec2 uCorrection2[32];  // contrastAdjust, exposureAdjust
    uniform int uCvdType;      // 0=none, 1=protan, 2=deutan, 3=tritan
    uniform float uCvdStrength;

    float srgbToLinear(float c) {
      return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4);
    }

    float linearToSrgb(float c) {
      return c <= 0.0031308 ? c * 12.92 : 1.055 * pow(c, 1.0 / 2.4) - 0.055;
    }

    vec3 daltonize(vec3 srgbColor, int type, float strength) {
      if (type == 0 || strength <= 0.0) return srgbColor;

      vec3 lin = vec3(srgbToLinear(srgbColor.r), srgbToLinear(srgbColor.g), srgbToLinear(srgbColor.b));
      mat3 sim;
      mat3 errMat;
      if (type == 1) {
        sim = mat3(0.152286, 0.114503, -0.003882,  1.052583, 0.786281, -0.048116,  -0.204868, 0.099216, 1.051998);
        errMat = mat3(0.0, 0.7, 0.7,  0.0, 1.0, 0.0,  0.0, 0.0, 1.0);
      } else if (type == 2) {
        sim = mat3(0.367322, 0.280085, -0.011820,  0.860646, 0.672501, 0.042940,  -0.227968, 0.047413, 0.968881);
        errMat = mat3(0.0, 0.7, 0.7,  0.0, 1.0, 0.0,  0.0, 0.0, 1.0);
      } else {
        sim = mat3(1.255528, -0.078411, 0.004733,  -0.076749, 0.930809, 0.691367,  -0.178779, 0.147602, 0.303900);
        errMat = mat3(1.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.7, 0.7, 0.0);
      }

      vec3 simulated = sim * lin;
      vec3 err = lin - simulated;
      vec3 correctedLin = clamp(lin + errMat * err, 0.0, 1.0);
      vec3 correctedSrgb = vec3(
        linearToSrgb(correctedLin.r), linearToSrgb(correctedLin.g), linearToSrgb(correctedLin.b)
      );
      return mix(srgbColor, correctedSrgb, strength);
    }

    vec3 rgb2lab(vec3 c) {
      float r = srgbToLinear(c.r);
      float g = srgbToLinear(c.g);
      float b = srgbToLinear(c.b);
      float X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
      float Y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
      float Z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
      float Xn = 0.95047; float Yn = 1.0; float Zn = 1.08883;
      float fx = X / Xn > 0.008856 ? pow(X / Xn, 1.0 / 3.0) : ((X / Xn) / (3.0 * 0.20705 * 0.20705) + 4.0 / 29.0);
      float fy = Y / Yn > 0.008856 ? pow(Y / Yn, 1.0 / 3.0) : ((Y / Yn) / (3.0 * 0.20705 * 0.20705) + 4.0 / 29.0);
      float fz = Z / Zn > 0.008856 ? pow(Z / Zn, 1.0 / 3.0) : ((Z / Zn) / (3.0 * 0.20705 * 0.20705) + 4.0 / 29.0);
      return vec3(116.0 * fy - 16.0, 500.0 * (fx - fy), 200.0 * (fy - fz));
    }

    vec3 rgb2hsl(vec3 c) {
      float mx = max(max(c.r, c.g), c.b);
      float mn = min(min(c.r, c.g), c.b);
      float h = 0.0; float s = 0.0; float l = (mx + mn) * 0.5;
      float d = mx - mn;
      if (d > 0.0001) {
        s = d / (1.0 - abs(2.0 * l - 1.0));
        if (mx == c.r) { h = mod((c.g - c.b) / d, 6.0); }
        else if (mx == c.g) { h = (c.b - c.r) / d + 2.0; }
        else { h = (c.r - c.g) / d + 4.0; }
        h *= 60.0;
        if (h < 0.0) h += 360.0;
      }
      return vec3(h, s, l);
    }

    vec3 hsl2rgb(vec3 hsl) {
      float h = hsl.x; float s = hsl.y; float l = hsl.z;
      float c = (1.0 - abs(2.0 * l - 1.0)) * s;
      float x = c * (1.0 - abs(mod(h / 60.0, 2.0) - 1.0));
      float m = l - c * 0.5;
      vec3 rgb1;
      if (h < 60.0) { rgb1 = vec3(c, x, 0.0); }
      else if (h < 120.0) { rgb1 = vec3(x, c, 0.0); }
      else if (h < 180.0) { rgb1 = vec3(0.0, c, x); }
      else if (h < 240.0) { rgb1 = vec3(0.0, x, c); }
      else if (h < 300.0) { rgb1 = vec3(x, 0.0, c); }
      else { rgb1 = vec3(c, 0.0, x); }
      return rgb1 + m;
    }

    float cvLuminance(vec3 c) {
      return dot(c, vec3(0.299, 0.587, 0.114));
    }

    // Sobel edge detection on luminance, sampled from the raw camera
    // texture (not the corrected result) so outline strength reflects
    // real scene edges regardless of the current blend/CVD settings.
    // thickness scales the sample offsets — Outlines mode and Cartoon
    // mode each pass their own independent thickness value in.
    float cvEdgeStrength(vec2 uv, float thickness) {
      vec2 t = uTexelSize * max(thickness, 0.0001);
      float tl = cvLuminance(texture(uTex, uv + vec2(-t.x, -t.y)).rgb);
      float tc = cvLuminance(texture(uTex, uv + vec2(0.0, -t.y)).rgb);
      float tr = cvLuminance(texture(uTex, uv + vec2(t.x, -t.y)).rgb);
      float ml = cvLuminance(texture(uTex, uv + vec2(-t.x, 0.0)).rgb);
      float mr = cvLuminance(texture(uTex, uv + vec2(t.x, 0.0)).rgb);
      float bl = cvLuminance(texture(uTex, uv + vec2(-t.x, t.y)).rgb);
      float bc = cvLuminance(texture(uTex, uv + vec2(0.0, t.y)).rgb);
      float br = cvLuminance(texture(uTex, uv + vec2(t.x, t.y)).rgb);
      float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
      float gy = -tl - 2.0 * tc - tr + bl + 2.0 * bc + br;
      return clamp(length(vec2(gx, gy)), 0.0, 1.0);
    }

    // Flattens colour into a handful of bold, punchy bands — the "flat
    // cel-shaded" half of a cartoon look. saturation is a direct
    // multiplier on the original saturation (1.0 = unchanged, 3.0 =
    // strongly boosted). Bold ink edges are added separately in main().
    vec3 cvCartoonize(vec3 c, float levels, float saturation) {
      vec3 hsl = rgb2hsl(c);
      hsl.y = clamp(hsl.y * saturation + 0.05, 0.0, 1.0);
      vec3 boosted = hsl2rgb(hsl);
      float lv = max(levels, 2.0);
      return clamp(floor(boosted * lv) / (lv - 1.0), 0.0, 1.0);
    }

    // How strongly the cartoon ink line shows at a given edge strength.
    // strength is a 0..1 fraction: higher makes softer edges trigger a
    // line (lower threshold) and makes the line itself more opaque/dark.
    float cvCartoonLine(vec2 uv, float thickness, float strength) {
      float edge = cvEdgeStrength(uv, thickness);
      float lo = mix(0.30, 0.04, strength);
      float hi = lo + 0.18;
      float opacity = mix(0.35, 1.0, strength);
      return smoothstep(lo, hi, edge) * opacity;
    }

    vec4 cameraLayer(vec3 rgb,float alpha){
      if(uNebulaEnabled>.5){if(alpha>.5)rgb=mix(rgb,vec3(5.0/255.0,5.0/255.0,10.0/255.0),.35);vec4 p=texture(uNebula,vec2(layerUv.x,1.0-layerUv.y));float a=p.a+alpha*(1.0-p.a);rgb=a>.0001?(p.rgb*p.a+rgb*alpha*(1.0-p.a))/a:vec3(0.0);alpha=a;}
      if(uFlashAlpha>0.0){if(alpha>.999){rgb=uFlashBlack>.5?mix(rgb,vec3(0.0),uFlashAlpha):1.0-(1.0-rgb)*(1.0-uFlashColor*uFlashAlpha);}else{float a=uFlashAlpha+alpha*(1.0-uFlashAlpha);vec3 c=uFlashBlack>.5?vec3(0.0):uFlashColor;rgb=a>.0001?(c*uFlashAlpha+rgb*alpha*(1.0-uFlashAlpha))/a:vec3(0.0);alpha=a;}}
      if(uBlackout>.5)return vec4(0.0,0.0,0.0,1.0);return vec4(rgb*alpha,alpha);
    }
    void main() {
      if(uCameraAvailable<.5){cameraColor=cameraLayer(vec3(0.0),0.0);return;}
      vec3 original = texture(uTex, vUv).rgb;
      vec3 base = daltonize(original, uCvdType, uCvdStrength);
      vec3 correction = vec3(0.0);
      vec2 correction2 = vec2(0.0);

      if (uPointCount > 0) {
        vec3 labP = rgb2lab(original);
        float totalWeight = 0.0;
        vec3 weightedSum = vec3(0.0);
        vec2 weightedSum2 = vec2(0.0);
        for (int i = 0; i < 32; i++) {
          if (i >= uPointCount) break;
          float d = distance(labP, uSourceLab[i]);
          float w = 1.0 / (d * d + uSpread);
          weightedSum += uCorrection[i] * w;
          weightedSum2 += uCorrection2[i] * w;
          totalWeight += w;
        }
        // A "null" anchor standing in for "no correction", weighted as if
        // a point were a fixed reference distance away. Without this, a
        // single saved colour's correction always normalizes to full
        // strength everywhere in the frame — the distance-based weight
        // cancels out of the ratio once there's nothing else to weigh it
        // against — so even wildly different colours would get the full
        // shift instead of it fading out. ~50 Lab units is a clearly
        // "very different colour" reference distance.
        totalWeight += 1.0 / (2500.0 + uSpread);
        correction = weightedSum / totalWeight;
        correction2 = weightedSum2 / totalWeight;
      }

      vec3 hsl = rgb2hsl(base);
      hsl.x = mod(hsl.x + correction.x + 360.0, 360.0);
      hsl.y = clamp(hsl.y + correction.y, 0.0, 1.0);
      hsl.z = clamp(hsl.z + correction.z, 0.0, 1.0);
      vec3 corrected = hsl2rgb(hsl);

      float contMul = 1.0 + correction2.x;
      float expMul = pow(2.0, correction2.y);
      corrected = clamp((corrected * expMul - 0.5) * contMul + 0.5, 0.0, 1.0);

      vec3 filled = mix(original, corrected, uBlend);
      vec3 finalColor = filled;
      if (uCartoonEnabled > 0.5) {
        vec3 toon = cvCartoonize(filled, uCartoonLevels, uCartoonSaturation);
        float line = cvCartoonLine(vUv, uCartoonEdgeThickness, uCartoonEdgeStrength);
        finalColor = mix(toon, vec3(0.02), line);
      }
      if (uOutlineEnabled > 0.5) {
        float edge = cvEdgeStrength(vUv, uOutlineThickness) * uOutlineOpacity;
        vec3 outlineColor = uOutlineColor * edge;
        finalColor = mix(finalColor, outlineColor, uOutlineBlend);
      }

      cameraColor = cameraLayer(finalColor,1.0);
    }
  `;
