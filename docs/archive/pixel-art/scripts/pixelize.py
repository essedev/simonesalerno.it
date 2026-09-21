# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""
pixelize - immagine (anche AI-generated) -> pixel art VETTORIALE (SVG) perfetta.

Concetto ripreso da IDKCraft Studio (il convertitore texture per il clone di
Minecraft) e migliorato per produrre SVG a griglia perfetta a dimensione
configurabile, invece di PNG 16x16 fissi.

Pipeline:
  1. (opz.) background removal: flood-fill dai bordi sul colore di sfondo dominante.
  2. supersample + downscale "dominant": l'immagine va su una griglia GxG perfetta;
     per ogni cella si vota il COLORE DOMINANTE del blocco (quantizzato a step 8),
     non la media -> bordi netti, niente fango. Alpha: cella opaca solo se il blocco
     e' >50% opaco, e il colore si calcola solo sui pixel opachi.
  3. palette: si estrae una palette adattiva di K colori con k-means in CIELAB
     (spazio percettivo) e ogni cella viene snappata al colore piu' vicino in LAB.
  4. output: SVG con un <rect> per run orizzontale di celle dello stesso colore,
     viewBox=GwxGh, shape-rendering=crispEdges -> nitido a qualunque scala.
     In piu' un PNG di anteprima (griglia scalata NEAREST) per il QA.

Uso:
  uv run scripts/pixelize.py INPUT.png --out OUT.svg --grid 56 --colors 16
  uv run scripts/pixelize.py INPUT.png --out OUT.svg --grid 56 --preview QA.png
Opzioni principali: --grid (lato lungo in celle), --colors (palette max),
  --alpha-threshold, --bg-remove/--no-bg-remove, --bg-tolerance, --supersample.
"""

from __future__ import annotations

import argparse
from collections import Counter, deque

import numpy as np
from PIL import Image

ALPHA_THRESHOLD = 128


# --------------------------------------------------------------------------- #
# CIELAB (da IDKCraft: snapping percettivo, non euclideo in RGB)
# --------------------------------------------------------------------------- #
def _srgb_to_linear(c: np.ndarray) -> np.ndarray:
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _linear_to_xyz(rgb: np.ndarray) -> np.ndarray:
    m = np.array(
        [
            [0.4124564, 0.3575761, 0.1804375],
            [0.2126729, 0.7151522, 0.0721750],
            [0.0193339, 0.1191920, 0.9503041],
        ]
    )
    return rgb @ m.T


_D65 = np.array([0.95047, 1.0, 1.08883])


def _xyz_to_lab(xyz: np.ndarray) -> np.ndarray:
    xyz = xyz / _D65
    mask = xyz > 0.008856
    f = np.where(mask, np.cbrt(xyz), 7.787 * xyz + 16.0 / 116.0)
    L = 116.0 * f[..., 1] - 16.0
    a = 500.0 * (f[..., 0] - f[..., 1])
    b = 200.0 * (f[..., 1] - f[..., 2])
    return np.stack([L, a, b], axis=-1)


def rgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    return _xyz_to_lab(_linear_to_xyz(_srgb_to_linear(rgb.astype(np.float64))))


# --------------------------------------------------------------------------- #
# 1. background removal (flood-fill dai bordi) - da IDKCraft
# --------------------------------------------------------------------------- #
def auto_remove_background(img: Image.Image, tolerance: int = 40) -> Image.Image:
    img = img.convert("RGBA")
    px = np.array(img)
    h, w = px.shape[:2]

    # gia' trasparente a sufficienza -> niente da fare
    if (px[:, :, 3] < ALPHA_THRESHOLD).sum() / px[:, :, 3].size > 0.05:
        return img

    border = []
    for x in range(w):
        border.append(px[0, x, :3])
        border.append(px[h - 1, x, :3])
    for y in range(1, h - 1):
        border.append(px[y, 0, :3])
        border.append(px[y, w - 1, :3])
    q = (np.array(border, dtype=np.int64) // 16) * 16
    bg = np.array(Counter(map(tuple, q)).most_common(1)[0][0], dtype=np.float64)

    visited = np.zeros((h, w), dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if np.linalg.norm(px[y, x, :3] - bg) < tolerance:
                queue.append((y, x))
    for y in range(1, h - 1):
        for x in (0, w - 1):
            if np.linalg.norm(px[y, x, :3] - bg) < tolerance:
                queue.append((y, x))

    while queue:
        cy, cx = queue.popleft()
        if visited[cy, cx] or np.linalg.norm(px[cy, cx, :3] - bg) >= tolerance:
            continue
        visited[cy, cx] = True
        px[cy, cx] = [0, 0, 0, 0]
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                queue.append((ny, nx))
    return Image.fromarray(px, "RGBA")


def crop_to_content(img: Image.Image, pad_frac: float = 0.02) -> Image.Image:
    """Ritaglia al bounding box dei pixel opachi (+ piccolo padding), cosi' la
    griglia spende risoluzione sul soggetto e non sui margini vuoti."""
    img = img.convert("RGBA")
    a = np.array(img)[:, :, 3]
    ys, xs = np.where(a >= ALPHA_THRESHOLD)
    if len(xs) == 0:
        return img
    l, r, t, b = xs.min(), xs.max(), ys.min(), ys.max()
    pad = round(max(r - l, b - t) * pad_frac)
    w, h = img.size
    return img.crop((max(0, l - pad), max(0, t - pad), min(w, r + 1 + pad), min(h, b + 1 + pad)))


# --------------------------------------------------------------------------- #
# 2. downscale "dominant" su griglia GxG perfetta
# --------------------------------------------------------------------------- #
def downscale_dominant(
    img: Image.Image, grid: int, supersample: int = 16, alpha_threshold: int = ALPHA_THRESHOLD
) -> tuple[np.ndarray, np.ndarray]:
    """Ritorna (rgb_grid HxWx3 uint8, opaque_mask HxW bool). Il lato lungo = grid."""
    img = img.convert("RGBA")
    w, h = img.size
    scale = grid / max(w, h)
    gw, gh = max(1, round(w * scale)), max(1, round(h * scale))
    # supersample a blocchi interi: ogni cella = supersample x supersample px
    big = img.resize((gw * supersample, gh * supersample), Image.LANCZOS)
    px = np.array(big)

    rgb = np.zeros((gh, gw, 3), dtype=np.uint8)
    opaque = np.zeros((gh, gw), dtype=bool)
    s = supersample
    for ty in range(gh):
        for tx in range(gw):
            block = px[ty * s : (ty + 1) * s, tx * s : (tx + 1) * s].reshape(-1, 4)
            a = block[:, 3]
            om = a >= alpha_threshold
            if om.sum() / len(a) < 0.5:
                continue  # cella trasparente
            opaque[ty, tx] = True
            brgb = block[om, :3]
            # voto colore dominante (quantizzato a step 8) poi media dei matching
            qz = (brgb // 8) * 8
            dom = Counter(map(tuple, qz)).most_common(1)[0][0]
            m = np.all(qz == dom, axis=1)
            rgb[ty, tx] = brgb[m].mean(axis=0).astype(np.uint8)
    return rgb, opaque


# --------------------------------------------------------------------------- #
# 3. palette adattiva + snap in CIELAB
# --------------------------------------------------------------------------- #
def _kmeans_lab(colors_rgb: np.ndarray, k: int, iters: int = 30) -> np.ndarray:
    """k-means in LAB; init deterministico coi colori piu' frequenti."""
    uniq, counts = np.unique(colors_rgb, axis=0, return_counts=True)
    if len(uniq) <= k:
        return uniq
    seeds = uniq[np.argsort(-counts)[:k]].astype(np.float64)
    lab_all = rgb_to_lab(colors_rgb)
    cent = rgb_to_lab(seeds)
    for _ in range(iters):
        d = np.linalg.norm(lab_all[:, None, :] - cent[None, :, :], axis=2)
        assign = d.argmin(axis=1)
        new = cent.copy()
        for i in range(k):
            sel = colors_rgb[assign == i]
            if len(sel):
                new[i] = rgb_to_lab(sel.mean(axis=0, keepdims=True))[0]
        if np.allclose(new, cent):
            break
        cent = new
    # ritorna i colori palette come media RGB dei cluster
    pal = []
    for i in range(k):
        sel = colors_rgb[assign == i]
        if len(sel):
            pal.append(sel.mean(axis=0).astype(np.uint8))
    return np.array(pal, dtype=np.uint8)


def quantize_palette(
    rgb: np.ndarray, opaque: np.ndarray, colors: int
) -> tuple[np.ndarray, np.ndarray]:
    """Snap di ogni cella opaca al colore palette piu' vicino in LAB."""
    flat = rgb[opaque]
    if len(flat) == 0:
        return rgb, np.zeros((0, 3), np.uint8)
    palette = _kmeans_lab(flat, colors)
    pal_lab = rgb_to_lab(palette)
    cell_lab = rgb_to_lab(flat)
    idx = np.linalg.norm(cell_lab[:, None, :] - pal_lab[None, :, :], axis=2).argmin(axis=1)
    out = rgb.copy()
    out[opaque] = palette[idx]
    return out, palette


# --------------------------------------------------------------------------- #
# 4. output SVG (run-length) + preview
# --------------------------------------------------------------------------- #
def to_svg(rgb: np.ndarray, opaque: np.ndarray) -> str:
    gh, gw = opaque.shape
    rects = []
    for y in range(gh):
        x = 0
        while x < gw:
            if not opaque[y, x]:
                x += 1
                continue
            c = tuple(rgb[y, x])
            run = 1
            while x + run < gw and opaque[y, x + run] and tuple(rgb[y, x + run]) == c:
                run += 1
            rects.append(
                f'<rect x="{x}" y="{y}" width="{run}" height="1" '
                f'fill="#{c[0]:02x}{c[1]:02x}{c[2]:02x}"/>'
            )
            x += run
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {gw} {gh}" '
        f'shape-rendering="crispEdges">{"".join(rects)}</svg>'
    )


def preview_png(rgb: np.ndarray, opaque: np.ndarray, zoom: int = 14, bg=(12, 12, 12)) -> Image.Image:
    gh, gw = opaque.shape
    canvas = np.zeros((gh, gw, 3), dtype=np.uint8)
    canvas[:] = bg
    canvas[opaque] = rgb[opaque]
    return Image.fromarray(canvas, "RGB").resize((gw * zoom, gh * zoom), Image.NEAREST)


# --------------------------------------------------------------------------- #
def run(args: argparse.Namespace) -> None:
    img = Image.open(args.input).convert("RGBA")
    if args.bg_remove:
        img = auto_remove_background(img, tolerance=args.bg_tolerance)
    if args.crop:
        img = crop_to_content(img)
    rgb, opaque = downscale_dominant(
        img, grid=args.grid, supersample=args.supersample, alpha_threshold=args.alpha_threshold
    )
    rgb, palette = quantize_palette(rgb, opaque, colors=args.colors)
    svg = to_svg(rgb, opaque)
    with open(args.out, "w") as f:
        f.write(svg)
    gh, gw = opaque.shape
    print(f"{args.input} -> {args.out}")
    print(f"  grid {gw}x{gh}  palette {len(palette)} colori  svg {len(svg)} B")
    if args.preview:
        preview_png(rgb, opaque).save(args.preview)
        print(f"  preview {args.preview}")


def main() -> None:
    p = argparse.ArgumentParser(description="immagine -> pixel-art SVG perfetta")
    p.add_argument("input")
    p.add_argument("--out", required=True, help="path SVG di output")
    p.add_argument("--grid", type=int, default=56, help="lato lungo in celle (default 56)")
    p.add_argument("--colors", type=int, default=16, help="max colori palette (default 16)")
    p.add_argument("--supersample", type=int, default=16, help="px per cella nel voto (default 16)")
    p.add_argument("--alpha-threshold", type=int, default=ALPHA_THRESHOLD)
    p.add_argument("--bg-remove", dest="bg_remove", action="store_true", default=True)
    p.add_argument("--no-bg-remove", dest="bg_remove", action="store_false")
    p.add_argument("--bg-tolerance", type=int, default=40)
    p.add_argument("--crop", dest="crop", action="store_true", default=True)
    p.add_argument("--no-crop", dest="crop", action="store_false")
    p.add_argument("--preview", help="path PNG di anteprima (griglia scalata NEAREST)")
    run(p.parse_args())


if __name__ == "__main__":
    main()
