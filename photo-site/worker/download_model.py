"""Explicitly download the Apache-2.0 Small checkpoint and record its revision."""
import argparse
import json
from pathlib import Path
from huggingface_hub import HfApi, snapshot_download
from depth import MODEL_ID

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="photo-site/model")
    args = parser.parse_args()
    revision = HfApi().model_info(MODEL_ID).sha
    target = Path(args.output).resolve()
    snapshot_download(MODEL_ID, revision=revision, local_dir=target,
                      allow_patterns=["*.json", "*.safetensors", "README.md"])
    (target / "tradesight-model.json").write_text(json.dumps({
        "model": MODEL_ID, "revision": revision, "license": "Apache-2.0",
        "implementation": "Hugging Face Transformers (Pillow preprocessing)",
    }, indent=2), encoding="utf-8")
    print(f"Downloaded Small model revision {revision} to {target}")
