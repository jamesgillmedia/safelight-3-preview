#!/usr/bin/env python3
"""Private: take a core-defaults.js saved from Tune -> Developer -> Save to core and put it in place (core/private/).
Checks it is the right file (one window.GJ_CORE_DEFAULTS = {...} with JSON inside) before it writes."""
import json, pathlib, re, sys
src = pathlib.Path(sys.argv[1]).expanduser().read_text()
m = re.search(r'window\.GJ_CORE_DEFAULTS\s*=\s*(\{.*\})\s*;?\s*$', src, re.S)
if not m: sys.exit('not a core-defaults.js from Save to core')
d = json.loads(m.group(1))
for k in ('store', 'dials', 'moon'): assert isinstance(d.get(k, {}), dict), k
dst = pathlib.Path(__file__).with_name('core-defaults.js'); dst.write_text(src)
print('saved', dst, '·', ', '.join('%s %d' % (k, len(d.get(k) or {})) for k in ('store', 'dials', 'moon')))
