/* Showcase page only: fills every "Show code" panel with the demo's real HTML,
   copies class names, and highlights the section you're reading. Runs before webplate.js. */
(() => {
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const dedent = s => {
    const lines = s.replace(/^\n+|\s+$/g, '').split('\n');
    const pad = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    return lines.map(l => l.slice(pad)).join('\n');
  };

  let n = 0;
  for (const demo of document.querySelectorAll('.demo:not(.is-snippet)')) {
    const stage = demo.querySelector('.demo-stage');
    const html = dedent(stage.innerHTML);
    const id = 'code-' + ++n;
    const box = document.createElement('details');
    box.className = 'demo-code';
    box.innerHTML = `<summary><button class="wp-btn wp-btn--sm wp-btn--ghost" type="button" data-wp-copy-from="#${id}">Copy</button></summary><pre><code id="${id}">${esc(html)}</code></pre>`;
    box.querySelector('button').addEventListener('click', e => e.preventDefault(), true);
    demo.appendChild(box);
  }

  /* click a class name to copy it */
  for (const c of document.querySelectorAll('.fx-name code')) {
    c.title = 'Copy class';
    c.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(c.textContent); } catch (_) {}
      const old = c.textContent;
      c.textContent = 'copied';
      setTimeout(() => { c.textContent = old; }, 1000);
    });
  }

  /* highlight the current section in the side nav */
  const links = new Map([...document.querySelectorAll('.side a')].map(a => [a.getAttribute('href').slice(1), a]));
  const seen = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) {
      for (const a of links.values()) a.classList.remove('is-here');
      const a = links.get(e.target.id);
      if (a) { a.classList.add('is-here'); a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    }
  }, { rootMargin: '-40% 0px -55% 0px' });
  for (const id of links.keys()) { const s = document.getElementById(id); if (s) seen.observe(s); }

  document.getElementById('year').textContent = new Date().getFullYear();

  /* the hold demo confirms only once the hold completes */
  document.addEventListener('wp:held', e => { if (e.target.id === 'hold-demo' && window.wpToast) wpToast('Deleted'); });
})();
