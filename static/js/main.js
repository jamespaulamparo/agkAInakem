/**
 * agkAInakem — Core Interactive Engine
 * Instant Bilingual Toggle (EN | FIL), Micro-animations, Daily Tracker & Modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Instant Bilingual (EN / FIL) Language Switcher
  // =========================================================================
  const currentLang = localStorage.getItem('agk_lang') || 'en';
  setLanguage(currentLang);

  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.getAttribute('data-lang');
      if (selectedLang) {
        setLanguage(selectedLang);
      }
    });
  });

  function setLanguage(lang) {
    localStorage.setItem('agk_lang', lang);

    // Update active pill state
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    // Update all elements with data-en and data-fil
    document.querySelectorAll('[data-en][data-fil]').forEach(el => {
      const targetText = lang === 'fil' ? el.getAttribute('data-fil') : el.getAttribute('data-en');
      if (targetText) {
        // If it's an input or textarea with placeholder
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.setAttribute('placeholder', targetText);
        } else {
          el.innerHTML = targetText;
        }
      }
    });

    // Toggle dedicated language container blocks
    document.querySelectorAll('.lang-block-en').forEach(el => {
      el.style.display = lang === 'en' ? '' : 'none';
    });
    document.querySelectorAll('.lang-block-fil').forEach(el => {
      el.style.display = lang === 'fil' ? '' : 'none';
    });

    document.documentElement.setAttribute('lang', lang);
  }

  // =========================================================================
  // 2. Scroll Reveal Animations (Intersection Observer)
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // =========================================================================
  // 3. Mobile Navigation Menu Toggle
  // =========================================================================
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
      if (!navMenu.contains(event.target) && !mobileToggle.contains(event.target)) {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // =========================================================================
  // 4. Sample Prompt Chips in Discovery
  // =========================================================================
  const promptChips = document.querySelectorAll('.prompt-chip');
  const discoveryInput = document.getElementById('discoveryInput');

  promptChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const currentLang = localStorage.getItem('agk_lang') || 'en';
      const promptText = currentLang === 'fil' && chip.hasAttribute('data-prompt-fil')
        ? chip.getAttribute('data-prompt-fil')
        : chip.getAttribute('data-prompt') || chip.textContent.trim();
      
      if (discoveryInput) {
        discoveryInput.value = promptText;
        discoveryInput.focus();
        discoveryInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // =========================================================================
  // 5. Daily Tracker Interactive Mood Selection
  // =========================================================================
  const moodOptions = document.querySelectorAll('.mood-option');
  const moodInput = document.getElementById('selectedMoodInput');

  moodOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      moodOptions.forEach(o => o.classList.remove('is-selected'));
      opt.classList.add('is-selected');
      const val = opt.getAttribute('data-mood');
      if (moodInput) {
        moodInput.value = val;
      }
    });
  });
});
