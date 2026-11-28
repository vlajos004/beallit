/* Látogatottságmérés (GoatCounter), sütik és személyes azonosító nélkül.
   GC_CODE: a GoatCounter-fiók neve (pl. 'beallit' → https://beallit.goatcounter.com). Üresen semmit nem küld.
   A saját látogatásaidat így kapcsolod ki ezen a böngészőn: nyisd meg a https://beallit.hu/#nostat címet
   (visszakapcsolás: #stat). */
(function () {
  var GC_CODE = 'ezegyfiok';
  var host = location.hostname.replace(/^www\./, '');
  var off = false;
  try {
    if (location.hash === '#nostat') localStorage.setItem('beallit_nostat', '1');
    if (location.hash === '#stat') localStorage.removeItem('beallit_nostat');
    off = localStorage.getItem('beallit_nostat') === '1';
  } catch (e) {}
  var live = GC_CODE && host === 'beallit.hu' && !off;
  var bot = navigator.webdriver ? 153 : (window.callPhantom || window._phantom || window.__nightmare) ? 150 : 0;
  var sent = {};

  function send(path, title, isEvent) {
    if (!live) return;
    var ref = '';
    if (!isEvent && document.referrer) {
      try { if (new URL(document.referrer).hostname.replace(/^www\./, '') !== host) ref = document.referrer; } catch (e) {}
    }
    var q = ['p=' + encodeURIComponent(path), 't=' + encodeURIComponent(title || ''), 'e=' + (isEvent ? 'true' : 'false'),
      'r=' + encodeURIComponent(ref), 'q=' + encodeURIComponent(isEvent ? '' : location.search),
      's=' + encodeURIComponent([screen.width, screen.height, window.devicePixelRatio || 1].join(',')),
      'rnd=' + Math.random().toString(36).slice(2)];
    if (bot) q.push('b=' + bot);
    new Image().src = 'https://' + GC_CODE + '.goatcounter.com/count?' + q.join('&');
  }
  // Esemény; once: oldalbetöltésenként csak egyszer számít
  function ev(name, title, once) {
    if (once) { if (sent[name]) return; sent[name] = 1; }
    send(name, title, true);
  }
  window.bStat = ev;

  send(location.pathname.replace(/\/index\.html$/, '/'), document.title, false);

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    // Kattintások: elérhetőségek és kimenő linkek
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var h = a.getAttribute('href');
      if (/^tel:/.test(h)) ev('kattintas-telefon', 'Telefonszámra koppintott');
      else if (/^mailto:/.test(h)) ev('kattintas-email', 'E-mail címre kattintott');
      else if (/instagram\.com/.test(h)) ev('kattintas-instagram', 'Instagramra kattintott');
      else if (/facebook\.com/.test(h)) ev('kattintas-facebook', 'Facebookra kattintott');
      else if (/google\./.test(h) || /g\.page/.test(h)) ev('kattintas-cegprofil', 'Google Cégprofilra kattintott');
      else if (/adatkezeles/.test(h)) ev('kattintas-adatkezeles', 'Adatkezelési tájékoztatót megnyitotta');
      else if (/^https?:/.test(h) && a.hostname.replace(/^www\./, '') !== host) ev('kattintas-kulso-' + a.hostname, 'Külső link: ' + a.hostname);
    }, true);

    // Meddig görget: szakaszok és görgetési mélység
    var names = { szolgaltatasok: 'Szolgáltatások', demo: 'Foglaló bemutató', folyamat: 'Folyamat', ajanlat: 'Ajánlatkérés', kapcsolat: 'Kapcsolat', gyik: 'GYIK' };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (x) {
          if (!x.isIntersecting) return;
          io.unobserve(x.target);
          ev('lathato-' + x.target.id, 'Odagörgetett: ' + names[x.target.id], true);
        });
      }, { threshold: 0.25 });
      Object.keys(names).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    }
    var marks = [25, 50, 75, 100];
    function depth() {
      var d = document.documentElement, max = d.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 100;
      marks.forEach(function (m) { if (pct >= m - 2) ev('gorgetes-' + m, 'Görgetés: az oldal ' + m + '%-áig', true); });
    }
    window.addEventListener('scroll', function () { clearTimeout(depth.t); depth.t = setTimeout(depth, 250); }, { passive: true });

    // Mennyi időt tölt az oldalon (csak amíg látható a lap)
    var spent = 0, steps = [[15, '15 mp'], [60, '1 perc'], [180, '3 perc']];
    setInterval(function () {
      if (document.hidden) return;
      spent += 5;
      steps.forEach(function (s) { if (spent >= s[0]) ev('ido-' + s[0] + 's', 'Az oldalon töltött idő: legalább ' + s[1], true); });
    }, 5000);

    // Videó, GYIK, foglaló bemutató
    var film = document.getElementById('film');
    if (film) film.addEventListener('volumechange', function () { if (!film.muted) ev('video-hang', 'Bekapcsolta a videó hangját', true); });
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target : null;
      if (!t) return;
      if (t.closest('.faq-toggle')) ev('gyik-megnyitas', 'Lenyitotta a GYIK-et', true);
      var fq = t.closest('.faq-q');
      if (fq) { var txt = fq.textContent.trim().slice(0, 70); ev('gyik-' + txt.toLowerCase().replace(/[^a-z0-9áéíóöőúüű]+/g, '-').slice(0, 40), 'GYIK kérdés: ' + txt, true); }
      if (t.closest('#booking')) ev('demo-hasznalat', 'Kipróbálta a foglaló bemutatót', true);
    }, true);
  });
})();
