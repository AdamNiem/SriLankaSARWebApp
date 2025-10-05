import torch
import numpy as np


def iou(pred, target, thr=0.5):
    pred = (pred > thr).float()
    intersection = (pred * target).sum()
    union = ((pred + target) > 0).float().sum()
    if union == 0:
        return 1.0
    return (intersection / union).item()


def bce_dice_loss(pred, target):
    bce = torch.nn.functional.binary_cross_entropy(pred, target)
    pred_bin = (pred > 0.5).float()
    smooth = 1.0
    intersection = (pred_bin * target).sum()
    dice = (2.0 * intersection + smooth) / (pred_bin.sum() + target.sum() + smooth)
    return bce + (1 - dice)
*** End Patch