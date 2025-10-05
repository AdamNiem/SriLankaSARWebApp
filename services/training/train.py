import argparse
import os
import torch
from torch.utils.data import DataLoader
from dataset import SARDataset
from model import UNet
from utils import bce_dice_loss, iou
from tqdm import tqdm


def train_epoch(model, loader, opt, device):
    model.train()
    total_loss = 0.0
    for x, y in tqdm(loader, desc='train'):
        x = x.to(device)
        y = y.to(device)
        pred = model(x)
        loss = bce_dice_loss(pred, y)
        opt.zero_grad()
        loss.backward()
        opt.step()
        total_loss += loss.item()
    return total_loss / len(loader)


@torch.no_grad()
def validate(model, loader, device):
    model.eval()
    ious = []
    for x, y in tqdm(loader, desc='val'):
        x = x.to(device)
        y = y.to(device)
        pred = model(x)
        ious.append(iou(pred, y))
    return sum(ious) / len(ious)


def main(args):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    train_ds = SARDataset(length=200)
    val_ds = SARDataset(length=50)
    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size)

    model = UNet(in_channels=2, out_channels=1).to(device)
    opt = torch.optim.AdamW(model.parameters(), lr=args.lr)

    best_iou = 0.0
    os.makedirs('checkpoints', exist_ok=True)
    for epoch in range(1, args.epochs + 1):
        train_loss = train_epoch(model, train_loader, opt, device)
        val_iou = validate(model, val_loader, device)
        print(f"Epoch {epoch} - train_loss={train_loss:.4f} val_iou={val_iou:.4f}")
        # checkpoint
        if val_iou > best_iou:
            best_iou = val_iou
            torch.save(model.state_dict(), os.path.join('checkpoints', 'best.pth'))


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--epochs', type=int, default=10)
    p.add_argument('--batch-size', type=int, default=8)
    p.add_argument('--lr', type=float, default=1e-4)
    args = p.parse_args()
    main(args)
*** End Patch