# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""
draw_chip - microchip pixel-art PRECISO, disegnato proceduralmente (non estratto
da immagine), da innestare sul cappello. QFP: corpo + bordo + core cyan glow +
file di pin sui 4 lati. Parametri regolabili (dimensione, n. pin, colori pin).

Uso:
  uv run scripts/draw_chip.py --out chip.svg --preview chip.png --size 18 --pins 3
"""
from __future__ import annotations

import argparse
import numpy as np
from PIL import Image

# palette (RGB)
TRANSP = None
K = (7, 11, 17)        # bordo quasi-nero
BODY = (32, 41, 58)    # corpo slate
BODY_D = (19, 25, 38)  # ombra interna corpo
CORE = (44, 195, 247)  # cyan accento
CORE_H = (201, 242, 255)  # highlight core
CORE_S = (21, 137, 188)   # ombra core
PIN = (233, 181, 62)   # pin ambra
PIN_D = (150, 110, 30)  # pin ombra

# preset colore pin
PIN_PRESETS = {
    "amber": (233, 181, 62),
    "silver": (176, 184, 196),
    "cyan": (125, 221, 251),
}


def draw_chip(size: int = 18, pins: int = 3, pin_len: int = 2, pin_color=PIN):
    """Ritorna (rgb HxWx3 uint8, opaque HxW bool) del chip su griglia size x size."""
    n = size
    rgb = np.zeros((n, n, 3), dtype=np.uint8)
    op = np.zeros((n, n), dtype=bool)

    m = pin_len + 1          # margine: pin + 1 cella d'aria
    b0, b1 = m, n - 1 - m    # estensione corpo [b0..b1]
    pin_dark = tuple(int(c * 0.6) for c in pin_color)

    def setpx(x, y, c):
        if 0 <= x < n and 0 <= y < n:
            rgb[y, x] = c
            op[y, x] = True

    # corpo + bordo
    for y in range(b0, b1 + 1):
        for x in range(b0, b1 + 1):
            edge = x in (b0, b1) or y in (b0, b1)
            shade = (x >= b1 - 1) or (y >= b1 - 1)
            setpx(x, y, K if edge else (BODY_D if shade else BODY))

    # core cyan al centro
    c0, c1 = b0 + 2, b1 - 2
    for y in range(c0, c1 + 1):
        for x in range(c0, c1 + 1):
            if x == c0 or y == c0:
                setpx(x, y, CORE_H)        # highlight alto/sinistra
            elif x == c1 or y == c1:
                setpx(x, y, CORE_S)        # ombra basso/destra
            else:
                setpx(x, y, CORE)

    # pin sui 4 lati, distribuiti uniformemente lungo il corpo
    span = b1 - b0
    positions = [round(b0 + span * (i + 1) / (pins + 1)) for i in range(pins)]
    for p in positions:
        for d in range(1, pin_len + 1):
            # top / bottom
            setpx(p, b0 - d, pin_color if d == 1 else pin_dark)
            setpx(p, b1 + d, pin_color if d == 1 else pin_dark)
            # left / right
            setpx(b0 - d, p, pin_color if d == 1 else pin_dark)
            setpx(b1 + d, p, pin_color if d == 1 else pin_dark)
    return rgb, op


def to_svg(rgb, op):
    gh, gw = op.shape
    rects = []
    for y in range(gh):
        x = 0
        while x < gw:
            if not op[y, x]:
                x += 1
                continue
            c = tuple(rgb[y, x])
            run = 1
            while x + run < gw and op[y, x + run] and tuple(rgb[y, x + run]) == c:
                run += 1
            rects.append(f'<rect x="{x}" y="{y}" width="{run}" height="1" fill="#{c[0]:02x}{c[1]:02x}{c[2]:02x}"/>')
            x += run
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {gw} {gh}" '
        f'shape-rendering="crispEdges">{"".join(rects)}</svg>'
    )


def preview(rgb, op, zoom=26, bg=(12, 12, 12)):
    gh, gw = op.shape
    canvas = np.zeros((gh, gw, 3), dtype=np.uint8)
    canvas[:] = bg
    canvas[op] = rgb[op]
    return Image.fromarray(canvas, "RGB").resize((gw * zoom, gh * zoom), Image.NEAREST)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--out", required=True)
    p.add_argument("--preview")
    p.add_argument("--size", type=int, default=18)
    p.add_argument("--pins", type=int, default=3)
    p.add_argument("--pin-len", type=int, default=2)
    p.add_argument("--pin", choices=list(PIN_PRESETS), default="amber")
    a = p.parse_args()
    rgb, op = draw_chip(size=a.size, pins=a.pins, pin_len=a.pin_len, pin_color=PIN_PRESETS[a.pin])
    open(a.out, "w").write(to_svg(rgb, op))
    print(f"chip {a.size}x{a.size} pins={a.pins} -> {a.out}")
    if a.preview:
        preview(rgb, op).save(a.preview)
        print(f"preview {a.preview}")


if __name__ == "__main__":
    main()
