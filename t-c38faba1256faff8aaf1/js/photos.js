/* Photo reel list: one group per work cluster, paths relative to this preview root. */
window.GJ3_PHOTOS = function () {
  return fetch('data.json').then(function (r) { return r.json(); }).then(function (d) {
    var map = {}, all = [];
    (d.chapters || []).forEach(function (ch) {
      var list = [];
      (ch.cards || []).forEach(function (c) {
        var m = c.media || {};
        if (!m.big && !m.thumb) return;
        var item = {
          id: c.id, series: ch.nm, title: (c.title && c.title !== 'untitled') ? c.title : '',
          cap: c.body || '', thumb: m.thumb, big: m.big || m.thumb, w: m.w || 4, h: m.h || 5, page: ''
        };
        list.push(item); all.push(item);
      });
      map[ch.k] = list;
    });
    map._all = all;
    window.GJ3_PHOTO_MAP = map;
    return map;
  });
};
