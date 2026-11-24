/* WebPlate behaviours. Plain JS, no dependencies. Include once:
   <script src="js/webplate.js" defer></script>
   Everything is opt-in through classes or data- attributes, so unused parts cost nothing. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const on = (sel, type, fn, opts) => document.addEventListener(type, e => {
    const el = e.target.closest && e.target.closest(sel);
    if (el) fn(e, el);
  }, opts);

  /* one-shot click animations: .wp-fx-ring .wp-fx-jelly .wp-fx-shake .wp-fx-pop */
  on('.wp-fx-ring, .wp-fx-jelly, .wp-fx-shake, .wp-fx-pop', 'click', (e, el) => {
    el.classList.remove('is-fx');
    void el.offsetWidth;
    el.classList.add('is-fx');
  });
  document.addEventListener('animationend', e => { if (e.target.classList) e.target.classList.remove('is-fx'); });

  /* ripple from the click point: .wp-fx-ripple */
  on('.wp-fx-ripple', 'pointerdown', (e, el) => {
    if (reduce) return;
    const r = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const ink = document.createElement('span');
    ink.className = 'wp-ripple-ink';
    ink.style.width = ink.style.height = size + 'px';
    ink.style.left = e.clientX - r.left - size / 2 + 'px';
    ink.style.top = e.clientY - r.top - size / 2 + 'px';
    el.appendChild(ink);
    ink.addEventListener('animationend', () => ink.remove());
  });

  /* tilt toward the cursor: .wp-fx-tilt */
  on('.wp-fx-tilt', 'pointermove', (e, el) => {
    if (reduce) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 16 + 'deg');
    el.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 16 + 'deg');
  });
  /* magnetic drift: .wp-fx-magnet */
  on('.wp-fx-magnet', 'pointermove', (e, el) => {
    if (reduce) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left - r.width / 2) * .25 + 'px');
    el.style.setProperty('--my', (e.clientY - r.top - r.height / 2) * .35 + 'px');
  });
  document.addEventListener('pointerout', e => {
    const el = e.target.closest && e.target.closest('.wp-fx-tilt, .wp-fx-magnet');
    if (el && !el.contains(e.relatedTarget)) for (const p of ['--rx', '--ry', '--mx', '--my']) el.style.removeProperty(p);
  });

  /* hold to confirm: .wp-fx-hold data-hold="1200" — fires a "wp:held" event on the button */
  on('.wp-fx-hold', 'pointerdown', (e, el) => {
    const ms = +el.dataset.hold || 1200, t0 = performance.now();
    let raf;
    const stop = () => { cancelAnimationFrame(raf); el.style.setProperty('--hold', 0); removeEventListener('pointerup', stop); el.removeEventListener('pointerleave', stop); };
    const step = now => {
      const p = Math.min(1, (now - t0) / ms);
      el.style.setProperty('--hold', p);
      if (p < 1) raf = requestAnimationFrame(step);
      else { stop(); el.dispatchEvent(new CustomEvent('wp:held', { bubbles: true })); }
    };
    raf = requestAnimationFrame(step);
    addEventListener('pointerup', stop);
    el.addEventListener('pointerleave', stop);
  });

  /* letters that rise one by one: .wp-fx-letters (splits its text on load) */
  for (const el of document.querySelectorAll('.wp-fx-letters')) {
    const text = el.textContent;
    el.setAttribute('aria-label', text.trim());
    el.innerHTML = [...text].map((c, i) => `<span class="wp-l" aria-hidden="true" style="--i:${i}">${c.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]))}</span>`).join('');
  }

  /* demo loading → done: data-wp-load="Saved" */
  on('[data-wp-load]', 'click', (e, el) => {
    if (el.classList.contains('is-loading') || el.classList.contains('is-done')) return;
    const label = el.innerHTML;
    el.classList.add('is-loading');
    setTimeout(() => {
      el.classList.remove('is-loading');
      el.classList.add('is-done');
      el.textContent = el.dataset.wpLoad || 'Done';
      setTimeout(() => { el.classList.remove('is-done'); el.innerHTML = label; }, 1400);
    }, 1200);
  });

  /* copy text: data-wp-copy="text to copy" (or data-wp-copy-from="#id") */
  on('[data-wp-copy], [data-wp-copy-from]', 'click', async (e, el) => {
    const src = el.dataset.wpCopyFrom ? document.querySelector(el.dataset.wpCopyFrom) : null;
    const text = src ? src.textContent : el.dataset.wpCopy;
    try { await navigator.clipboard.writeText(text); } catch (_) {
      const t = document.createElement('textarea');
      t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (_) {}
      t.remove();
    }
    const old = el.getAttribute('data-label') || el.textContent;
    el.setAttribute('data-label', old);
    el.textContent = 'Copied';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.textContent = old; }, 1400);
  });

  /* segmented buttons: .wp-btn-group[data-wp-single] keeps one pressed */
  on('.wp-btn-group[data-wp-single] .wp-btn', 'click', (e, el) => {
    for (const b of el.parentElement.children) b.setAttribute('aria-pressed', b === el);
  });

  /* tabs: .wp-tabs with role="tab" buttons pointing at panels via aria-controls */
  on('.wp-tabs [role="tab"]', 'click', (e, el) => {
    for (const t of el.parentElement.querySelectorAll('[role="tab"]')) {
      const sel = t === el;
      t.setAttribute('aria-selected', sel);
      t.tabIndex = sel ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !sel;
    }
  });
  on('.wp-tabs [role="tab"]', 'keydown', (e, el) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const tabs = [...el.parentElement.querySelectorAll('[role="tab"]')];
    const next = tabs[(tabs.indexOf(el) + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    next.focus(); next.click();
  });

  /* modals: <button data-wp-open="id"> opens <dialog id="id" class="wp-modal">, [data-wp-close] closes */
  on('[data-wp-open]', 'click', (e, el) => { const d = document.getElementById(el.dataset.wpOpen); if (d) d.showModal(); });
  on('[data-wp-close]', 'click', (e, el) => { const d = el.closest('dialog'); if (d) d.close(); });
  on('.wp-modal', 'click', (e, el) => { if (e.target === el) el.close(); });

  /* removable tags */
  on('.wp-tag [data-wp-remove]', 'click', (e, el) => el.closest('.wp-tag').remove());

  /* toasts: wpToast('Saved') or <button data-wp-toast="Saved"> */
  function wpToast(msg, ms = 2400) {
    let box = document.querySelector('.wp-toasts');
    if (!box) { box = document.createElement('div'); box.className = 'wp-toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'wp-toast';
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => { t.classList.add('is-out'); t.addEventListener('animationend', () => t.remove(), { once: true }); }, ms);
  }
  on('[data-wp-toast]', 'click', (e, el) => wpToast(el.dataset.wpToast));
  window.wpToast = wpToast;

  /* theme: wpTheme('dark' | 'light' | 'system'), remembered on this device */
  function wpTheme(mode) {
    const root = document.documentElement;
    if (mode === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', mode);
    try { localStorage.setItem('wp-theme', mode); } catch (_) {}
  }
  try { const saved = localStorage.getItem('wp-theme'); if (saved && saved !== 'system') document.documentElement.setAttribute('data-theme', saved); } catch (_) {}
  on('[data-wp-theme]', 'click', (e, el) => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    wpTheme(dark ? 'light' : 'dark');
  });
  window.wpTheme = wpTheme;
})();
