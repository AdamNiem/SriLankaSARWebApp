# Training scaffold

This folder contains a minimal PyTorch training scaffold for a flood prediction segmentation model.
It uses synthetic data by default so you can run a quick smoke training without real satellite tiles.

Structure
- `dataset.py` - a simple Dataset that returns synthetic SAR-like tiles and water masks. Replace with a real dataset loader.
- `model.py` - small U-Net implementation.
- `train.py` - training loop with logging, validation, and checkpointing.
- `utils.py` - helpers for metrics and visualization.

Quickstart

```bash
cd services/training
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train.py --epochs 2 --batch-size 8
```

Replace `dataset.SARDataset` with a loader that reads your preprocessed tiles and masks.
