"""Collect the public company phone number from each shop's own site (tel: links first, then NL number patterns).
Usage: python3 -I phone_crawl.py approved.csv out.csv"""
import csv, sys, re, html, ssl, urllib.request, concurrent.futures as cf
from collections import Counter
P, OUT = sys.argv[1], sys.argv[2]
rows = [r for r in csv.DictReader(open(P, encoding='utf-8')) if r['email'] and ('sequence' in r['status'])]
CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36', 'Accept-Language': 'nl-NL,nl;q=0.9'}
PATHS = ['/contact', '/pages/contact', '/klantenservice', '/policies/contact-information', '/contact-us', '/pages/klantenservice', '/']
TEL = re.compile(r'href=["\']tel:([^"\']+)["\']', re.I)
NUM = re.compile(r'(?<![\d+])(?:\+31|0031|0)\s?(?:\(0\)\s?)?[1-9](?:[\s\-.]?\d){8}(?!\d)')
def fetch(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=12, context=CTX) as r:
            return r.read(1_500_000).decode('utf-8', 'ignore'), r.geturl()
    except Exception:
        return '', ''
def normalize(n):
    d = re.sub(r'[^\d+]', '', n)
    if d.startswith('0031'): d = '+31' + d[4:]
    if d.startswith('+310'): d = '+31' + d[4:]
    if d.startswith('0') and len(d) == 10: d = '+31' + d[1:]
    return d if re.fullmatch(r'\+31[1-9]\d{8}', d) else None
def crawl(r):
    dom = r['email'].split('@')[-1]
    base = None
    for b in (f'https://www.{dom}', f'https://{dom}'):
        t, _ = fetch(b + '/')
        if t: base = b; break
    if not base: return r, '', 'site onbereikbaar'
    for p in PATHS:
        t, final = fetch(base + p)
        if not t: continue
        tels = [normalize(x) for x in TEL.findall(t)]
        tels = [x for x in tels if x]
        if tels:
            return r, Counter(tels).most_common(1)[0][0], final or base + p
        txt = re.sub(r'(?s)<(script|style)[^>]*>.*?</\1>', ' ', t)
        txt = html.unescape(re.sub(r'<[^>]+>', ' ', txt))
        nums = [normalize(x) for x in NUM.findall(txt)]
        nums = [x for x in nums if x]
        if nums:
            return r, Counter(nums).most_common(1)[0][0], (final or base + p) + ' (tekst)'
    return r, '', 'geen nummer gevonden'
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    res = list(ex.map(crawl, rows))
with open(OUT, 'w', encoding='utf-8', newline='') as f:
    w = csv.writer(f); w.writerow(['bedrijf', 'contactpersoon', 'functietitel', 'telefoon', 'bron', 'status'])
    for r, tel, src in res: w.writerow([r['bedrijf'], r['contactpersoon'], r['functietitel'], tel, src, r['status'][:40]])
print('found', sum(1 for _, t, _ in res if t), 'of', len(res))
for r, t, s in res:
    if not t: print('  missing:', r['bedrijf'], '|', r['email'].split('@')[-1], '|', s)
