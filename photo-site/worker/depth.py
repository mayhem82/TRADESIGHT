"""Small-model relative depth only. No metric reconstruction or hidden surfaces."""
import io
import json
import numpy as np
from PIL import Image, ImageOps

MODEL_ID = "depth-anything/Depth-Anything-V2-Small-hf"
BOUNDARY = "Inferred relative depth and an unscaled relief surface. Not measured geometry, dimensions, or a complete 3D reconstruction."
MAX_BYTES = 12 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 20_000_000


def decode_photo(data):
    if not data or len(data) > MAX_BYTES:
        raise ValueError("Choose a JPEG, PNG or WebP photo under 12 MB.")
    try:
        with Image.open(io.BytesIO(data)) as source:
            if source.format not in {"JPEG", "PNG", "WEBP"} or getattr(source, "n_frames", 1) != 1:
                raise ValueError("Choose a single JPEG, PNG or WebP photo. Export HEIC as JPEG first.")
            if source.width * source.height > Image.MAX_IMAGE_PIXELS:
                raise ValueError("Photo exceeds 20 megapixels. Resize it first.")
            photo = ImageOps.exif_transpose(source).convert("RGB")
            photo.thumbnail((1600, 1600))
            return photo
    except (OSError, Image.DecompressionBombError) as error:
        raise ValueError("This file could not be decoded as a supported photo.") from error


def relief(depth, photo):
    depth = np.asarray(depth, dtype=np.float32)
    if depth.shape != (photo.height, photo.width) or not np.isfinite(depth).all():
        raise ValueError("Model returned invalid depth values.")
    low, high = float(depth.min()), float(depth.max())
    normalized = np.zeros_like(depth) if high == low else (depth - low) / (high - low)
    size = (max(2, round(96 * photo.width / max(photo.size))),
            max(2, round(96 * photo.height / max(photo.size))))
    grid = np.asarray(Image.fromarray(normalized).resize(size, Image.Resampling.BILINEAR))
    return normalized, {
        "width": size[0], "height": size[1], "aspect": photo.width / photo.height,
        "values": grid.ravel().round(6).tolist(), "nearIsHigh": True,
        "units": "none", "boundary": BOUNDARY,
    }


class SmallEstimator:
    def __init__(self, model_path):
        # Explicit local snapshot: serving never silently downloads model weights.
        import torch
        from transformers import AutoImageProcessor, AutoModelForDepthEstimation
        self.torch = torch
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.processor = AutoImageProcessor.from_pretrained(model_path, local_files_only=True)
        self.model = AutoModelForDepthEstimation.from_pretrained(
            model_path, local_files_only=True).to(self.device).eval()
        if self.model.config.model_type != "depth_anything" or self.model.config.backbone_config.hidden_size != 384:
            raise ValueError("Only Depth Anything V2 Small snapshots are accepted.")
        with open(model_path / "tradesight-model.json", encoding="utf-8") as file:
            self.provenance = json.load(file)
        if self.provenance["model"] != MODEL_ID:
            raise ValueError("Unexpected model provenance.")

    def __call__(self, photo):
        inputs = self.processor(images=photo, return_tensors="pt").to(self.device)
        with self.torch.inference_mode():
            output = self.model(**inputs)
            depth = self.torch.nn.functional.interpolate(
                output.predicted_depth.unsqueeze(1), size=(photo.height, photo.width),
                mode="bicubic", align_corners=False).squeeze().cpu().numpy()
        return depth


def save_result(folder, photo, depth, provenance):
    normalized, grid = relief(depth, photo)
    # Re-encoding drops EXIF metadata and GPS from the result photo.
    photo.save(folder / "photo.jpg", quality=90)
    Image.fromarray((normalized * 255).astype("uint8")).save(folder / "depth.png")
    np.save(folder / "relative-depth.npy", np.asarray(depth, dtype=np.float32))
    grid["provenance"] = provenance
    (folder / "relief.json").write_text(json.dumps(grid), encoding="utf-8")
    # OBJ is an arbitrary-unit 2.5D relief, not a calibrated camera reconstruction.
    w, h = grid["width"], grid["height"]
    lines = ["# " + BOUNDARY]
    for y in range(h):
        for x in range(w):
            lines.append(f"v {(x/(w-1)-0.5)*grid['aspect']:.6f} {0.5-y/(h-1):.6f} {grid['values'][y*w+x]*0.3:.6f}")
    for y in range(h-1):
        for x in range(w-1):
            a = y*w+x+1
            lines.extend([f"f {a} {a+w} {a+1}", f"f {a+1} {a+w} {a+w+1}"])
    (folder / "inferred-relief.obj").write_text("\n".join(lines), encoding="utf-8")
