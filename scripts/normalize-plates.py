#!/usr/bin/env python3
"""Rebuild every recipe plate on a square transparent canvas with a consistent plate size and
position, keeping the soft drop shadow fully inside the image so nothing is clipped.

Needs Pillow + numpy.  Run from the repo root:  python3 scripts/normalize-plates.py
Sources are the Figma exports in assets/crumbs/; output goes to assets/crumbs/plates/{hero,tile}/<key>.png.
  hero: 418px square, plate centred (recipe detail, plan rows, cooking)
  tile: 400px square, plate larger in frame (Browse tiles, Home meal card)
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

A = Path('assets/crumbs')
PLATE = 337  # plate diameter in the Figma exports, in px
SOURCES = {
    'chicken': 'crumbs-food-image-recipe-honey-sriracha-chicken-100-806.png',
    'souvlaki': 'crumbs-food-image-recipe-chicken-souvlaki-100-808.png',
    'ratatouille': 'crumbs-food-image-recipe-tomato-lentil-ratatouille-100-810.png',
    'tofu': 'crumbs-food-image-recipe-tofu-piccata-100-812.png',
    'toasts': 'crumbs-food-image-recipe-additional-recipe-image-114-1096.png',
}
# canvas size, plate top-left (x centred, y chosen so the shadow, ~35px below the plate, stays inside)
SETS = {'hero': (418, 40), 'tile': (400, 22)}

def solid_bbox(img):
    a = np.array(img.getchannel('A'))
    ys, xs = np.where(a > 200)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def place(img, bbox, size, top):
    x0, y0, x1, y1 = bbox
    cx = (x0 + x1) / 2
    left = round(size / 2 - cx)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(img, (left, top - y0)) if left >= 0 and top - y0 >= 0 else canvas.paste(img, (left, top - y0), img)
    return canvas

def synthetic_shadow(plate):
    """Match the baked shadow of the Figma exports: ~#272727, ~8% at the plate edge, fading over ~35px, offset down."""
    w, h = plate.size
    pad = 70
    mask = Image.new('L', (w + 2 * pad, h + 2 * pad), 0)
    mask.paste(plate.getchannel('A'), (pad, pad + 12))
    mask = mask.filter(ImageFilter.GaussianBlur(15))
    shadow = Image.new('RGBA', mask.size, (39, 39, 39, 0))
    shadow.putalpha(mask.point(lambda v: int(v * 0.17)))
    out = shadow.copy()
    out.alpha_composite(plate, (pad, pad))
    return out

def main():
    for name, (size, top) in SETS.items():
        (A / 'plates' / name).mkdir(parents=True, exist_ok=True)
    jobs = {k: Image.open(A / f).convert('RGBA') for k, f in SOURCES.items()}
    ph = Image.open(A / 'recipe-placeholder.png').convert('RGBA')
    bx = solid_bbox(ph)
    plate = ph.crop(bx)
    scale = PLATE / plate.width
    plate = plate.resize((PLATE, round(plate.height * scale)), Image.LANCZOS)
    jobs['placeholder'] = synthetic_shadow(plate)
    for key, img in jobs.items():
        bbox = solid_bbox(img)
        for name, (size, top) in SETS.items():
            out = place(img, bbox, size, top)
            out.save(A / 'plates' / name / f'{key}.png', optimize=True)
            print(name, key, out.size)

if __name__ == '__main__':
    main()
