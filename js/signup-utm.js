/* Neemt campagneparameters uit de URL van deze pagina mee naar de aanmeldlink
   (2026-10-18, promotieplan self-serve Voice agent). Leest alleen
   location.search en slaat niets op: geen cookies, geen localStorage. Het
   dashboard bewaart utm_source/medium/campaign/content en ref bij de aanmelding
   (App\Support\SignupAttribution); de overige sleutels gaan mee zodat ze later
   bruikbaar zijn zonder deze pagina's opnieuw aan te passen. */
(function () {
  var keep = /^(utm_(source|medium|campaign|content|term)|ref|gclid|gbraid|wbraid|fbclid|oppref)$/;
  var carry = [];
  try {
    new URLSearchParams(window.location.search).forEach(function (value, key) {
      if (keep.test(key) && value && value.length <= 200) carry.push([key, value]);
    });
  } catch (e) { return; }
  if (!carry.length) return;
  var links = document.querySelectorAll('a[href^="https://my.mowi.agency/aanmelden"]');
  Array.prototype.forEach.call(links, function (a) {
    try {
      var url = new URL(a.href);
      carry.forEach(function (pair) {
        if (!url.searchParams.has(pair[0])) url.searchParams.set(pair[0], pair[1]);
      });
      a.href = url.toString();
    } catch (e) { /* laat de link zoals hij was */ }
  });
})();
