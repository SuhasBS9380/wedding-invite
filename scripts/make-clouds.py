"""Cuts real cloud photos (../assets/clouds-src: Unsplash licence + our own sky photo) into transparent
cloud sprites for the intro cloud gate (public/assets/clouds/c*.webp).

Per photo: estimate the (smoothly varying) sky colour, key alpha on how much bluer than neutral each
pixel is relative to that sky, un-mix the sky colour out of semi-transparent edges, fade any edge where
a cloud was cut by the photo frame, then split into separate clumps.
usage: python scripts/make-clouds.py
"""
import glob, os, cv2, numpy as np

SRC, OUT, MAXW = '../assets/clouds-src', 'public/assets/clouds', 1300
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(f'{OUT}/c*.webp'):
    os.remove(f)


def sky_estimate(img, skymask):
    """Smooth sky colour everywhere, from pixels that are certainly sky (normalised blur)."""
    k = max(31, (min(img.shape[:2]) // 6) | 1)
    m = skymask.astype(np.float32)
    num = cv2.GaussianBlur(img * m[..., None], (k, k), 0)
    den = cv2.GaussianBlur(m, (k, k), 0)[..., None]
    est = num / np.maximum(den, 1e-3)
    fallback = img[skymask].mean(0) if skymask.any() else np.array([0.9, 0.6, 0.3])
    return np.where(den > 0.02, est, fallback)


def key(img):
    """img: float BGR 0..1 -> (rgb, alpha)."""
    b, g, r = img[..., 0], img[..., 1], img[..., 2]
    blue = b - r                                      # sky: strongly positive; cloud: ~0
    lum = img.mean(2)
    sure_sky = blue > np.percentile(blue, 70) * 0.85
    sky = sky_estimate(img, sure_sky)
    sky_blue = np.maximum(sky[..., 0] - sky[..., 2], 0.08)
    a = 1 - np.clip(blue / sky_blue, 0, 1)            # 1 = neutral (cloud), 0 = as blue as the sky
    a = np.clip((a - 0.12) / 0.78, 0, 1)
    a = a * a * (3 - 2 * a)                           # smoothstep
    a *= np.clip((lum - sky.mean(2)) / 0.12 + 0.6, 0, 1)  # clouds are brighter than the sky behind them
    raw = a.copy()                                    # (clump selection judges the photo's own density)
    # thicker: anything with real body goes solid, faint sky haze drops out (crisper, fuller outlines)
    a = np.clip((a - 0.06) / 0.62, 0, 1)
    a = a * a * (3 - 2 * a)
    # un-mix: observed = a*C + (1-a)*sky  ->  C
    am = np.maximum(a, 0.05)[..., None]
    rgb = np.clip((img - (1 - a[..., None]) * sky) / am, 0, 1)
    rgb = np.where(a[..., None] < 0.05, 1.0, rgb)
    # Re-light as sunlit cumulus: the photo's luminance (contrast-stretched on the cloud pixels) picks
    # between a cool sky-lit shadow and a warm sunlit white. Removes the un-mixing fringes and the photo's
    # grey cast, and keeps the clouds' real 3-D shading.
    lum = rgb.mean(2)
    cloud = a > 0.5
    lo, hi = (np.percentile(lum[cloud], [3, 99.5]) if cloud.sum() > 100 else (0.4, 1.0))
    L = np.clip((lum - lo) / max(hi - lo, 1e-3), 0, 1) ** 0.75
    L = 0.55 * (L * L * (3 - 2 * L)) + 0.45 * L          # more contrast in the billows (volume)
    # thin edges are translucent and bright in real clouds; their un-mixed colour is noise, and once the
    # alpha is thickened it would show as a dark rim around every outline, so light the edges up
    edge = np.clip((raw - 0.15) / 0.55, 0, 1)
    edge = edge * edge * (3 - 2 * edge)
    L = L * edge + 0.93 * (1 - edge)
    # ...and a band just inside every outline (by distance from the edge): left-over sky colour there
    # reads as a blue-grey rim wherever one cloud overlaps another
    inside = (a > 0.5).astype(np.uint8)
    d = cv2.distanceTransform(inside, cv2.DIST_L2, 5)
    band = np.clip(d / (0.012 * max(a.shape)), 0, 1)
    band = band * band * (3 - 2 * band)
    L = L * band + np.maximum(L, 0.92) * (1 - band)
    shadow = np.array([0.84, 0.73, 0.64])               # BGR: blue-grey underside
    light = np.array([0.965, 0.985, 1.0])               # BGR: warm white top
    rgb = shadow * (1 - L[..., None]) + light * L[..., None]
    return np.clip(rgb, 0, 1), a, raw


def edge_fade(a, frac=0.10):
    """Fade alpha towards the photo frame so clouds cut by the frame get a soft edge."""
    h, w = a.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.minimum.reduce([xx, w - 1 - xx, yy, h - 1 - yy])
    fw = frac * min(h, w)
    return a * np.clip(d / fw, 0, 1) ** 0.8


def organic_fade(h, w, seed):
    """An oval fade with a lumpy, noisy rim: where a cloud was cut by the photo frame, its edge dissolves
    into an irregular outline instead of reading as a straight (rectangular) line against open sky."""
    rs = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.hypot((xx - w / 2) / (w / 2), (yy - h / 2) / (h / 2))
    noise = cv2.resize(rs.random((6, 8)).astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
    fine = cv2.resize(rs.random((18, 24)).astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
    r = r * (0.9 + 0.22 * noise + 0.12 * fine)
    x = np.clip((r - 0.74) / 0.3, 0, 1)                  # a soft lumpy edge, not a wide glowing gradient
    return 1 - x * x * (3 - 2 * x)


def volume_light(rgb, a):
    """Cumulus are lit from above: bright, warm crowns and flatter, darker blue-grey bases."""
    ys = np.nonzero(a.max(1) > 0.3)[0]
    if len(ys) < 2:
        return rgb
    top, bot = ys[0], ys[-1]
    t = np.clip((np.arange(a.shape[0]) - top) / max(bot - top, 1), 0, 1)[:, None, None]
    base = (t - 0.45) / 0.55
    base = np.clip(base, 0, 1)
    base = base * base * (3 - 2 * base)
    crown = np.clip(1 - t / 0.35, 0, 1)
    under = np.array([0.80, 0.70, 0.62])                # BGR, base tint
    rgb = rgb * (1 - 0.24 * base) + under * 0.24 * base
    return np.clip(rgb + 0.035 * crown, 0, 1)


n = 0
for path in sorted(glob.glob(f'{SRC}/*')):
    img = cv2.imread(path)
    if img is None:
        continue
    s = 2000 / max(img.shape[:2])
    if s < 1:
        img = cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    rgb, a, raw = key(img.astype(np.float32) / 255)
    a, raw = edge_fade(a), edge_fade(raw)
    # clumps: connected areas of visible cloud (bridged by a dilation); selection uses the raw density
    vis = (raw > 0.06).astype(np.uint8)
    blob = cv2.dilate(vis, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41)))
    cnt, lab, st, _ = cv2.connectedComponentsWithStats(blob)
    H, W = a.shape
    for i in range(1, cnt):
        x, y, w, h, area = st[i]
        mass = raw[lab == i].sum()
        if w < 0.16 * W or h < 0.08 * H or mass < 0.012 * W * H:
            continue                                   # small wisps
        pad = 12
        x0, y0, x1, y1 = max(0, x - pad), max(0, y - pad), min(W, x + w + pad), min(H, y + h + pad)
        sub_a = a[y0:y1, x0:x1] * (lab[y0:y1, x0:x1] == i)
        sub_raw = raw[y0:y1, x0:x1] * (lab[y0:y1, x0:x1] == i)
        vis_a = sub_raw[sub_raw > 0.06]
        if (vis_a > 0.9).mean() < 0.18:
            continue                                   # mostly semi-transparent mush (thin haze), not a cumulus
        sub_a = sub_a * organic_fade(*sub_a.shape, seed=n)
        sub_a = cv2.GaussianBlur(sub_a, (0, 0), 0.7)
        lit = volume_light(rgb[y0:y1, x0:x1], sub_a)
        sub = np.dstack([(lit * 255).round(), (sub_a * 255).round()]).astype(np.uint8)
        if sub.shape[1] > MAXW:
            sc = MAXW / sub.shape[1]
            sub = cv2.resize(sub, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
        n += 1
        out = f'{OUT}/c{n}.webp'
        cv2.imwrite(out, sub, [cv2.IMWRITE_WEBP_QUALITY, 82])
        # phones: a lighter copy, sized for the largest cloud a phone draws (~1100 device px wide)
        sm = sub
        if sub.shape[1] > 1100:
            sc = 1100 / sub.shape[1]
            sm = cv2.resize(sub, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
        out_sm = f'{OUT}/c{n}-sm.webp'
        cv2.imwrite(out_sm, sm, [cv2.IMWRITE_WEBP_QUALITY, 76])
        print(out, os.path.basename(path), f'{sub.shape[1]}x{sub.shape[0]}', f'{os.path.getsize(out) // 1024}KB',
              f'| sm {sm.shape[1]}px {os.path.getsize(out_sm) // 1024}KB')
