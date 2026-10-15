"""For each contact: fetch the email domain's public site and look for a KvK number;
compare with the KVK number our gate checked. Also notes Shopify/WooCommerce markers.
Usage: python3 -I kvk_site_check.py approved.csv apollo-list.txt out.tsv"""
import csv, sys, re, html, unicodedata, ssl, urllib.request, concurrent.futures as cf

appr_path, list_path, out_path = sys.argv[1:4]
def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z]+', ' ', s).strip()
appr = {norm(a['contactpersoon']): a for a in csv.DictReader(open(appr_path, encoding='utf-8'))}
rows = []
for line in open(list_path, encoding='utf-8'):
    parts = line.strip().split(' | ')
    if len(parts) < 3: continue
    a = appr.get(norm(parts[0]))
    rows.append((parts[0], parts[-1].split('@')[-1].lower(), a['kvk_nummer'] if a else '', a['kvk_naam'] if a else ''))

PATHS = ['/', '/policies/legal-notice', '/policies/contact-information', '/policies/terms-of-service',
         '/contact', '/pages/contact', '/algemene-voorwaarden', '/pages/algemene-voorwaarden',
         '/klantenservice', '/over-ons', '/privacy', '/privacyverklaring']
CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36', 'Accept-Language': 'nl-NL,nl;q=0.9'}
KW = re.compile(r'(?i)(kvk|k\.v\.k|kamer van koophandel|handelsregister|chamber of commerce|coc[\s-]*(nr|number|nummer)|registratienummer)')
NUM = re.compile(r'\d[\d .\-]{6,12}\d')

def fetch(url):
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=12, context=CTX) as r:
            return r.read(1_500_000).decode('utf-8', 'ignore'), r.geturl()
    except Exception:
        return '', ''

def text_of(t):
    t = re.sub(r'(?s)<(script|style|noscript)[^>]*>.*?</\1>', ' ', t)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t)))

def kvk_numbers(t):
    found = set()
    for m in KW.finditer(t):
        window = t[m.end():m.end() + 60]
        for n in NUM.finditer(window):
            d = re.sub(r'\D', '', n.group(0))
            if len(d) == 8: found.add(d); break
    return found

def check(row):
    name, dom, nr, kvk_naam = row
    if dom in ('ziggo.nl', 'gmail.com', 'hotmail.com', 'outlook.com', 'kpnmail.nl', 'live.nl'):
        return row + ('PRIVE-MAILBOX', '', '', '')
    base = None
    for b in (f'https://www.{dom}', f'https://{dom}'):
        t, final = fetch(b + '/')
        if t: base = b; break
    if not base:
        return row + ('SITE-ONBEREIKBAAR', '', '', '')
    final_host = re.sub(r'^https?://', '', final).split('/')[0]
    platform = set()
    nums, where = set(), ''
    for i, p in enumerate(PATHS):
        if i: t, _ = fetch(base + p)
        if not t: continue
        if re.search(r'(?i)cdn\.shopify\.com|Shopify\.theme', t): platform.add('shopify')
        if re.search(r'(?i)woocommerce|wc-block|wp-content/plugins/woocommerce', t): platform.add('woocommerce')
        n = kvk_numbers(text_of(t))
        if n:
            nums |= n; where = p
            break
    if not nums: verdict = 'GEEN-KVK-OP-SITE'
    elif nr in nums: verdict = 'MATCH'
    else: verdict = 'ANDER-KVK-NUMMER'
    return row + (verdict, ','.join(sorted(nums)), where, '+'.join(sorted(platform)) + (f' ({final_host})' if final_host and dom not in final_host else ''))

with cf.ThreadPoolExecutor(max_workers=10) as ex:
    results = list(ex.map(check, rows))
with open(out_path, 'w', encoding='utf-8') as f:
    f.write('naam\tdomein\tkvk_gecontroleerd\tkvk_naam\tuitkomst\tkvk_op_site\tpagina\tplatform\n')
    for r in results: f.write('\t'.join(r) + '\n')
from collections import Counter
print(Counter(r[4] for r in results))
for r in results:
    if r[4] != 'MATCH': print('\t'.join(r))
