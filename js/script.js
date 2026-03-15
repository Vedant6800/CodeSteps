/* =============================================
   CodeSteps — Shared JavaScript
   ============================================= */

'use strict';

// ── Theme Management ──────────────────────────
const THEME_KEY = 'codesteps-theme';

function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}



// ── Search Filter (homepage) ──────────────────
function initSearch() {
  const input = document.getElementById('search-input');
  const cards = document.querySelectorAll('.day-card');
  const noResults = document.getElementById('no-results');

  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(card => {
      const title = card.querySelector('.day-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.day-desc')?.textContent.toLowerCase() || '';
      const num = card.querySelector('.day-number')?.textContent.toLowerCase() || '';
      const dayId = card.getAttribute('data-day');
      const pageText = (typeof SEARCH_INDEX !== 'undefined' && SEARCH_INDEX[dayId]) ? SEARCH_INDEX[dayId] : '';

      const matches = title.includes(query) || desc.includes(query) || num.includes(query) || pageText.includes(query);
      card.classList.toggle('hidden', !matches);
      if (matches) visibleCount++;
    });

    if (noResults) {
      noResults.classList.toggle('show', visibleCount === 0 && query !== '');
    }
  });
}



// ── Copy Code Button ──────────────────────────
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const codeEl = btn.closest('.code-block-wrap')?.querySelector('code');
      if (!codeEl) return;
      // Extract plain text (strip HTML tags)
      const text = codeEl.innerText || codeEl.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });
}



// ── Scroll to Top ─────────────────────────────
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── Smooth navigation transition ─────────────
function initNavLinks() {
  document.querySelectorAll('a[href]').forEach(link => {
    // Only internal same-origin links
    if (link.hostname !== window.location.hostname) return;
    if (link.getAttribute('href').startsWith('#')) return;

    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.2s ease';
      setTimeout(() => { window.location.href = href; }, 200);
    });
  });
}

// ── Intersection Observer (animate on scroll) ─
function initScrollAnimations() {
  if (!window.IntersectionObserver) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.notes-card, .day-card').forEach(el => {
    if (el.style.animationDelay) return; // already handled by CSS animation
    observer.observe(el);
  });
}

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Theme
  applyTheme(getTheme());

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) toggleBtn.addEventListener('click', toggleTheme);

  // Features
  initSearch();
  initCopyButtons();
  initScrollTop();
  initScrollAnimations();

  // Fade in body
  document.body.style.opacity = '1';
  document.body.style.transition = 'opacity 0.3s ease';
});
