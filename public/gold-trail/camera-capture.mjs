// Capture one still from the existing stream. Never opens a second camera.
export async function captureCameraPhoto(track, video, options = {}) {
  if (!track || track.readyState !== 'live') throw new Error('Camera is not active.');
  const decode = options.createBitmap || globalThis.createImageBitmap;
  if (typeof decode !== 'function') throw new Error('This browser cannot open captured photos.');
  async function validate(blob) {
    const image = await decode(blob);
    try {
      if (!image.width || !image.height || image.width * image.height > 48000000)
        throw new Error('Captured photo exceeds the supported dimensions.');
      if (track.readyState !== 'live') throw new Error('Camera is not active.');
      return image;
    } catch (error) { image.close?.(); throw error; }
  }
  const ImageCaptureClass = options.ImageCaptureClass ?? globalThis.ImageCapture;
  if (ImageCaptureClass) {
    try {
      const operation = new ImageCaptureClass(track).takePhoto();
      let timer;
      let blob;
      try {
        blob = await Promise.race([operation, new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('Still photo timed out.')), options.timeoutMs ?? 15000);
        })]);
      } finally { clearTimeout(timer); }
      if (blob?.size && blob.size <= 25 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(blob.type)) {
        const bitmap = await validate(blob);
        if (options.retainBitmap) return { blob, bitmap, method: 'camera-still' };
        bitmap.close?.(); return { blob, method: 'camera-still' };
      }
    } catch {
      if (track.readyState !== 'live') throw new Error('Camera is not active.');
    }
  }
  if (track.readyState !== 'live') throw new Error('Camera is not active.');
  const width = video?.videoWidth, height = video?.videoHeight;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width * height > 48000000)
    throw new Error('A camera frame is not ready.');
  const canvas = (options.createCanvas || (() => document.createElement('canvas')))();
  canvas.width = width; canvas.height = height;
  canvas.getContext('2d').drawImage(video, 0, 0, width, height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .92));
  if (!blob || blob.size > 25 * 1024 * 1024) throw new Error('The camera frame could not be saved within the photo size limit.');
  const bitmap = await validate(blob);
  if (options.retainBitmap) return { blob, bitmap, method: 'video-frame', width, height };
  bitmap.close?.(); return { blob, method: 'video-frame', width, height };
}

export function isCurrentCapture(capture, current) {
  return !!capture && !!current && capture.generation === current.generation &&
    capture.stream === current.stream && capture.track?.readyState === 'live' && !current.hidden;
}

export function cameraPhotoLocation(location) {
  if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng) ||
      Math.abs(location.lat) > 90 || Math.abs(location.lng) > 180) return null;
  return { lat: location.lat, lng: location.lng,
    accuracy: Number.isFinite(location.accuracy) && location.accuracy >= 0 ? location.accuracy : null,
    source: 'camera-gps', datum: 'WGS-84',
    fixAt: typeof location.fixAt === 'string' ? location.fixAt : null };
}
