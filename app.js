(function () {
  // часы работы: [открытие, закрытие], 24/26 = 00:00/02:00 следующего дня. Пн = 0
  var HOURS = [[12, 24], [12, 24], [12, 24], [12, 24], [12, 26], [12, 26], [12, 24]];
  var DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  var root = document.documentElement;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rub(p) { return String(p).split(' / ').map(function (v) { return v.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }).join(' / ') + ' ₽'; }

  // --- 18+ ---
  document.getElementById('ageYes').addEventListener('click', function () {
    try { localStorage.setItem('rebra-age', 'yes'); } catch (e) {}
    root.classList.add('age-ok');
  });
  document.getElementById('ageNo').addEventListener('click', function () {
    document.getElementById('ageAsk').hidden = true;
    document.getElementById('ageDeny').hidden = false;
  });

  // --- глазировки ---
  var GLAZE = [
    { name: 'Classic BBQ', price: 730, w: '350 г', img: 'ribs-board', text: 'Главное блюдо бара: свиные рёбра в авторской глазировке BBQ по калифорнийскому рецепту.', tag: 'хит' },
    { name: 'Брусничная', price: 810, w: '270 г', img: 'ribs-cranberry', text: 'Протёртая брусника с прованскими травами. Сладко, с лёгкой ягодной кислинкой.' },
    { name: 'Взрывная кола', price: 770, w: '285 г', img: 'ribs-glaze', text: 'Классическая кола и взрывная карамель: сладко-пряная глазурь, которая хрустит.' },
    { name: 'Манго чили', price: 770, w: 'L', img: 'ribs-32', text: 'Подаётся с мятными кусочками ананаса. Тропики и лёгкий огонёк чили.', tag: 'new' },
    { name: 'Терияки-имбирь', price: 730, w: 'L', img: 'ribs-137', text: 'Медовый терияки с ноткой имбиря и корейской морковью.' },
    { name: 'Том-ям', price: 830, w: '280 г', img: 'ribs-136', text: 'Пряный кокосовый маринад с лемонграссом и чили.' },
    { name: 'Мраморные говяжьи', price: 1730, w: '570 г', img: 'ribs-36', text: 'Говяжьи рёбра в пряном соусе с бататом фри и фирменными огурчиками.', tag: 'премиум' },
    { name: 'Сковилл', price: null, w: 'S', img: 'ribs-138', text: 'Очень острые рёбра для смелых. Гости берут их как челлендж с друзьями. Можно запить молоком.', tag: 'острые' }
  ];
  var list = document.getElementById('glazeList'), card = document.getElementById('glazeCard');
  list.innerHTML = GLAZE.map(function (g, i) {
    return '<button role="tab" class="gl' + (i === 0 ? ' is-active' : '') + '" aria-selected="' + (i === 0) + '" data-i="' + i + '">' +
      '<span>' + esc(g.name) + '</span>' + (g.tag ? '<i>' + g.tag + '</i>' : '') + '</button>';
  }).join('');
  function showGlaze(i) {
    var g = GLAZE[i];
    card.innerHTML = '<figure><img src="img/' + g.img + '.webp" alt="Рёбра ' + esc(g.name) + '"></figure>' +
      '<div class="glaze__info"><h3>' + esc(g.name) + '</h3><p>' + esc(g.text) + '</p>' +
      '<p class="glaze__price">' + (g.price ? '<b>' + rub(g.price) + '</b><span>' + g.w + '</span>' : '<b class="hand">цену подскажет официант</b>') + '</p></div>';
    card.classList.remove('is-anim'); void card.offsetWidth; card.classList.add('is-anim');
  }
  list.addEventListener('click', function (e) {
    var b = e.target.closest('.gl'); if (!b) return;
    list.querySelectorAll('.gl').forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
    b.classList.add('is-active'); b.setAttribute('aria-selected', 'true');
    showGlaze(+b.dataset.i);
  });
  showGlaze(0);

  // --- меню ---
  var body = document.getElementById('menuBody'), tabs = document.querySelectorAll('.tab');
  function mark(m) {
    if (!m) return '';
    var cls = m === 'top' ? 'm-top' : m === 'new' ? 'm-new' : m === '0%' ? 'm-zero' : 'm-taste';
    var txt = m === 'top' ? 'Top' : m === '0%' ? 'alko free' : m;
    return ' <em class="mk ' + cls + '">' + esc(txt) + '</em>';
  }
  function render(key) {
    body.innerHTML = window.REBRA_MENU[key].map(function (g) {
      return '<section class="mgroup"><h3><span>' + esc(g.title) + '</span>' + (g.note ? '<small>' + esc(g.note) + '</small>' : '') + '</h3><ul>' +
        g.items.map(function (it) {
          return '<li><div class="mrow"><span>' + esc(it[0]) + mark(it[3]) + '</span><i aria-hidden="true"></i><b>' + rub(it[1]) + '</b></div>' +
            (it[2] ? '<small class="mdesc">' + esc(it[2]) + '</small>' : '') + '</li>';
        }).join('') + '</ul></section>';
    }).join('');
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
      t.classList.add('is-active'); t.setAttribute('aria-selected', 'true');
      render(t.dataset.tab);
    });
  });
  render('food');

  // --- пометка от руки: открыто / закрыто (Москва и Нижний в одном поясе) ---
  function hh(h) { return (h % 24 < 10 ? '0' : '') + (h % 24) + ':00'; }
  var msk = new Date(Date.now() + (new Date().getTimezoneOffset() + 180) * 60000);
  var d = (msk.getDay() + 6) % 7, h = msk.getHours() + msk.getMinutes() / 60;
  var prev = HOURS[(d + 6) % 7], cur = HOURS[d], open = false, until;
  if (prev[1] > 24 && h < prev[1] - 24) { open = true; until = prev[1]; }
  else if (h >= cur[0] && h < cur[1]) { open = true; until = cur[1]; }
  var note = document.getElementById('note');
  note.classList.add(open ? 'is-open' : 'is-closed');
  document.getElementById('noteText').textContent = open ? 'Открыто до ' + hh(until) + '!' : 'Откроемся в ' + hh(cur[0]);

  document.getElementById('week').innerHTML = DAYS.map(function (n, i) {
    return '<li' + (i === d ? ' class="is-today"' : '') + '><span>' + n + '</span><span>' + hh(HOURS[i][0]) + '–' + hh(HOURS[i][1]) + '</span></li>';
  }).join('');

  // --- header ---
  var top = document.querySelector('.top');
  var onScroll = function () { top.classList.toggle('is-solid', window.scrollY > 30); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = document.getElementById('burger'), nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var o = document.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', o);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { document.body.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); }
  });

  // --- reveal ---
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
