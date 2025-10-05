import numpy as np
import torch
from torch.utils.data import Dataset


class SyntheticFloodDataset(Dataset):
    """Generates synthetic SAR-like tiles and circular flood masks for testing."""

    def __init__(self, length=1000, size=128, channels=2):
        self.length = length
        self.size = size
        self.channels = channels

    def __len__(self):
        return self.length

    def __getitem__(self, idx):
        # synthetic SAR: random noise with blobs
        img = np.random.randn(self.channels, self.size, self.size).astype(np.float32) * 0.1
        # add a circular flood region
        cy = np.random.randint(32, self.size - 32)
        cx = np.random.randint(32, self.size - 32)
        r = np.random.randint(8, 30)
        yy, xx = np.ogrid[: self.size, : self.size]
        mask = ((yy - cy) ** 2 + (xx - cx) ** 2) <= r * r
        # raise SAR backscatter slightly in flooded region (synthetic behavior)
        for c in range(self.channels):
            img[c][mask] += 0.5 + np.random.randn() * 0.05

        img = torch.from_numpy(img)
        mask = torch.from_numpy(mask.astype(np.float32)).unsqueeze(0)
        return img, mask


# Small wrapper for real dataset swap
class SARDataset(SyntheticFloodDataset):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
*** End Patch