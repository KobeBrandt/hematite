#!/usr/bin/env python3
"""Check every Hematite colour pair against a contrast floor AND a ceiling.

Reads the colour tokens from css/tokens.css (light-dark() pairs or single
oklch values), converts oklch to sRGB, and computes WCAG 2 contrast ratios.

  floor: 7:1 for body text (ink), 4.5:1 for other text, 3:1 for non-text
  cap:   15:1 for every pair, so nothing is harsher than it needs to be

    python3 tools/check-contrast.py     (exit code 1 if a pair fails)
"""
import math, os, re, sys

CAP = 15.0
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
css = open(os.path.join(ROOT, 'css', 'tokens.css'), encoding='utf-8').read()
css = css[:css.index('@supports')]  # the main :root block; fallbacks repeat the same values

OKLCH = r'oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)'
tokens = {'light': {}, 'dark': {}}
for name, value in re.findall(r'--color-([\w-]+):\s*([^;]+);', css):
    found = [(float(l) / 100, float(c), float(h)) for l, c, h in re.findall(OKLCH, value)]
    if value.strip().startswith('light-dark(') and len(found) == 2:
        tokens['light'][name], tokens['dark'][name] = found
    elif len(found) == 1 and '/' not in value:
        tokens['light'][name] = tokens['dark'][name] = found[0]
for theme in tokens:  # aliases such as --color-on-ink: var(--color-bg)
    for name, value in re.findall(r'--color-([\w-]+):\s*var\(--color-([\w-]+)\)', css):
        if value in tokens[theme]:
            tokens[theme][name] = tokens[theme][value]

def to_srgb(L, C, h):
    a, b = C * math.cos(math.radians(h)), C * math.sin(math.radians(h))
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    rgb = (4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
           -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
           -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)
    return [min(1, max(0, x)) for x in rgb]

def luminance(c):
    return sum(w * x for w, x in zip((0.2126, 0.7152, 0.0722), to_srgb(*c)))

def ratio(a, b):
    hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)

# (foreground, background, floor, what it is)
PAIRS = [('ink', bg, 7, 'body text') for bg in ('bg', 'surface', 'sunken', 'accent-soft')]
PAIRS += [(t, bg, 4.5, 'text') for t in ('muted', 'link', 'danger', 'success', 'warning', 'info') for bg in ('bg', 'surface', 'sunken')]
PAIRS += [('on-fill', f'{k}-fill', 4.5, 'text on a status fill') for k in ('success', 'danger', 'warning', 'info')]
PAIRS += [('on-key', 'key', 7, 'label on a key'), ('on-ink', 'ink', 7, 'text on graphite fills'), ('on-accent', 'accent', 4.5, 'label on the accent')]
PAIRS += [('focus', bg, 3, 'focus outline') for bg in ('bg', 'surface')]
PAIRS += [('edge', bg, 3, 'edges of controls') for bg in ('bg', 'surface')]
PAIRS += [('accent', bg, 3, 'accent edges and checked controls') for bg in ('bg', 'surface')]
PAIRS += [('led', bg, 3, 'status light') for bg in ('bg', 'surface')]
PAIRS += [(t, 'bg', 3, 'status borders and fills') for t in ('danger', 'success', 'warning', 'info')]

failed = 0
for theme in ('light', 'dark'):
    t = tokens[theme]
    print(f'{theme}:')
    for fg, bg, floor, what in PAIRS:
        if fg not in t or bg not in t:
            print(f'  ?    {fg} on {bg}: token not found'); failed += 1; continue
        r = ratio(t[fg], t[bg])
        ok = floor <= r <= CAP
        failed += not ok
        print(f'  {"ok  " if ok else "FAIL"} {fg:>9} on {bg:<8} {r:5.1f}:1  ({what}, {floor}–{CAP:g})')
print('all pairs within range' if not failed else f'{failed} pair(s) out of range')
sys.exit(1 if failed else 0)
