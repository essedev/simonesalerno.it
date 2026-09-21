# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""
compose_chip - pixelizza il cappello e ci INNESTA sopra il chip pixel-perfect
(disegnato proceduralmente), al posto del blob cyan impreciso che esce dalla
pixelizzazione dell'immagine AI. Rileva la posizione del chip esistente dalle
celle cyan (mediana, robusta allo sparkle) e centra lo sprite chip li'.

Uso:
  uv run scripts/compose_chip.py HAT.png --out out.svg --grid 56 --chip-size 16 --pin amber --preview out.png
"""
from __future__ import annotations

import argparse
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from draw_chip import PIN_PRESETS, draw_chip  # noqa: E402
from pixelize import (  # noqa: E402
    auto_remove_background,
    crop_to_content,
    downscale_dominant,
    preview_png,
    quantize_palette,
    to_svg,
)

CORE = np.array([44, 195, 247])
CORE_H = np.array([201, 242, 255])


def find_chip_center(rgb, opaque, thresh=80):
    d1 = np.linalg.norm(rgb.astype(float) - CORE, axis=2)
    d2 = np.linalg.norm(rgb.astype(float) - CORE_H, axis=2)
    cyan = opaque & ((d1 < thresh) | (d2 < thresh))
    ys, xs = np.where(cyan)
    if len(xs) == 0:
        gh, gw = opaque.shape
        return gw // 2, int(gh * 0.62), cyan
    # mediana: robusta allo sparkle (cluster cyan minore in alto a dx)
    return int(np.median(xs)), int(np.median(ys)), cyan


def run(a):
    img = Image.open(a.input).convert("RGBA")
    img = auto_remove_background(img, tolerance=a.bg_tolerance)
    img = crop_to_content(img)
    rgb, opaque = downscale_dominant(img, grid=a.grid)
    rgb, _ = quantize_palette(rgb, opaque, colors=a.colors)

    cx, cy, cyan = find_chip_center(rgb, opaque)

    chip_rgb, chip_op = draw_chip(size=a.chip_size, pins=a.pins, pin_len=a.pin_len,
                                  pin_color=PIN_PRESETS[a.pin])
    s = a.chip_size
    x0, y0 = cx - s // 2, cy - s // 2

    # pulisci il vecchio blob cyan, poi innesta il chip preciso
    rgb = rgb.copy()
    opaque = opaque.copy()
    gh, gw = opaque.shape
    for y in range(gh):
        for x in range(gw):
            inside_chip = x0 <= x < x0 + s and y0 <= y < y0 + s
            if cyan[y, x] and not inside_chip:
                opaque[y, x] = False  # via i residui cyan fuori dal chip
    for y in range(s):
        for x in range(s):
            if not chip_op[y, x]:
                continue
            gx, gy = x0 + x, y0 + y
            if 0 <= gx < gw and 0 <= gy < gh:
                rgb[gy, gx] = chip_rgb[y, x]
                opaque[gy, gx] = True

    open(a.out, "w").write(to_svg(rgb, opaque))
    print(f"{a.input} grid {gw}x{gh}  chip@({cx},{cy}) size {s} pin {a.pin} -> {a.out}")
    if a.preview:
        preview_png(rgb, opaque).save(a.preview)
        print(f"  preview {a.preview}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("--out", required=True)
    p.add_argument("--grid", type=int, default=56)
    p.add_argument("--colors", type=int, default=16)
    p.add_argument("--chip-size", type=int, default=16)
    p.add_argument("--pins", type=int, default=3)
    p.add_argument("--pin-len", type=int, default=2)
    p.add_argument("--pin", choices=list(PIN_PRESETS), default="amber")
    p.add_argument("--bg-tolerance", type=int, default=40)
    p.add_argument("--preview")
    run(p.parse_args())


if __name__ == "__main__":
    main()
