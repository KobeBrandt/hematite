#!/usr/bin/env python3
"""Copy the docs and templates into dist/ with every local <script src> inlined.

Some hosts (sandboxed previews, strict Content-Security-Policy) refuse to load
script files from their own origin but allow inline scripts. In the copy made
here the docs work on such hosts; the CSS stays in separate files.

    python3 tools/build-docs.py [out-dir]     (default: dist)
"""
import os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist'))
SCRIPT = re.compile(r'<script src="(?!https?:)([^"]+)"(?: defer)?></script>')

def inline(path):
    html = open(path, encoding='utf-8').read()
    def rep(m):
        src = os.path.normpath(os.path.join(os.path.dirname(path), m.group(1)))
        code = open(src, encoding='utf-8').read().replace('</script', '<\\/script')
        return '<script>\n' + code + '</script>'
    return SCRIPT.sub(rep, html)

for folder in ('css', 'js', 'icons', 'templates', 'docs'):
    shutil.copytree(os.path.join(ROOT, folder), os.path.join(OUT, folder), dirs_exist_ok=True)
pages = ['index.html'] + [d + '/' + f for d in ('docs', 'templates')
                          for f in sorted(os.listdir(os.path.join(ROOT, d))) if f.endswith('.html')]
for page in pages:
    with open(os.path.join(OUT, page), 'w', encoding='utf-8') as f:
        f.write(inline(os.path.join(ROOT, page)))
print(f'{len(pages)} pages written to {OUT}')
