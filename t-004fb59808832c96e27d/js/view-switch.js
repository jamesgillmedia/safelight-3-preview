/* The one new piece: a Photolab / Constellation switch. Both pages share the hash so the same work stays in view. */
(function (w) {
  function work() {
    try {
      if (w.__s3 && w.__s3.st) {
        var f = w.__s3.st().foc;
        if (f) return f;
      }
    } catch (e) {}
    var h = (location.hash || '').replace(/^#/, '');
    if (h && h !== 'photo') return h;
    return '';
  }
  function href(page) {
    var k = work();
    return page + (k ? '#' + k : '');
  }
  function mount() {
    var box = document.getElementById('viewSwitch');
    if (!box) return;
    var here = document.body.classList.contains('lab') ? 'lab' : 'sky';
    var lab = href('index.html');
    var sky = href('sky.html');
    /* rewrite just before click so the current work is kept */
    box.innerHTML =
      '<a href="' + lab + '" data-to="index.html"' + (here === 'lab' ? ' aria-current="page"' : '') + '>Photolab</a>' +
      '<a href="' + sky + '" data-to="sky.html"' + (here === 'sky' ? ' aria-current="page"' : '') + '>Constellation</a>';
    box.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-to]');
      if (!a) return;
      e.preventDefault();
      location.href = href(a.getAttribute('data-to'));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
  w.GJ_VIEW = { work: work, href: href };
})(window);
