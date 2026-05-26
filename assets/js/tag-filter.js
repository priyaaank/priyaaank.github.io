// Filters a [data-post-list] by a free-text search box and a row of tag
// chips. Both filters apply together (AND). The active tag also wires up
// to the small per-post tag pills, so clicking a tag inside a post item
// jumps the filter to that tag.
(function () {
  var root = document.querySelector('[data-tag-filter]');
  if (!root) return;

  var scope = root.closest('article') || document;
  var input = root.querySelector('.filter-search');
  var chips = Array.prototype.slice.call(root.querySelectorAll('.filter-chips .chip'));
  var items = Array.prototype.slice.call(scope.querySelectorAll('[data-post-list] > li'));
  var emptyMsg = scope.querySelector('.filter-empty');
  var activeTag = '';

  function apply() {
    var q = (input ? input.value : '').toLowerCase().trim();
    var visible = 0;

    items.forEach(function (item) {
      var tags = (item.getAttribute('data-tags') || '')
        .toLowerCase()
        .split(/[,\s]+/)
        .filter(Boolean);
      var text = (item.getAttribute('data-search') || '').toLowerCase();

      var tagOk = !activeTag || tags.indexOf(activeTag.toLowerCase()) > -1;
      var textOk = !q || text.indexOf(q) > -1;
      var show = tagOk && textOk;

      item.hidden = !show;
      if (show) visible++;
    });

    if (emptyMsg) emptyMsg.hidden = visible > 0;
  }

  function setActiveTag(tag, opts) {
    opts = opts || {};
    // Chip clicks toggle; per-post tag clicks always set.
    if (opts.toggle && tag === activeTag) {
      activeTag = '';
    } else {
      activeTag = tag;
    }
    chips.forEach(function (c) {
      c.classList.toggle('active', c.getAttribute('data-tag') === activeTag);
    });
    apply();
  }

  if (input) input.addEventListener('input', apply);

  chips.forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      e.preventDefault();
      setActiveTag(chip.getAttribute('data-tag'), { toggle: true });
    });
  });

  // Per-post inline tags as a shortcut to filter.
  Array.prototype.forEach.call(
    scope.querySelectorAll('[data-post-list] .tag'),
    function (el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        setActiveTag(el.getAttribute('data-tag'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  );
})();
