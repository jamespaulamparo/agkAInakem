/**
 * agkAInakem — Minimalist Interactive Script
 * Handles decluttered dropdowns, accessible accordions, sample chips, and scroll reveals.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll Reveal Animation (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver isn't supported
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // 2. Navigation Dropdowns (Click & Keyboard accessibility)
  const navDropdowns = document.querySelectorAll('.nav-dropdown');
  navDropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    const menu = dropdown.querySelector('.nav-dropdown-menu');

    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = dropdown.classList.contains('is-open');
        // Close other dropdowns
        navDropdowns.forEach(d => {
          if (d !== dropdown) {
            d.classList.remove('is-open');
            d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
          }
        });
        dropdown.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', !isOpen);
      });
    }
  });

  // Close dropdowns on click outside
  document.addEventListener('click', (e) => {
    navDropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
        dropdown.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // 3. Mobile Navigation Menu Toggle
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('open');
    });

    // Close when clicking outside mobile menu
    document.addEventListener('click', (event) => {
      if (!navMenu.contains(event.target) && !mobileToggle.contains(event.target)) {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 4. Minimalist Collapsible Accordions
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');
  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      if (!item) return;

      const isOpen = item.classList.contains('is-open');

      // Optional: keep single accordion open per group if desired
      const group = item.closest('.accordion-group');
      if (group && group.hasAttribute('data-single')) {
        group.querySelectorAll('.accordion-item').forEach(other => {
          if (other !== item) {
            other.classList.remove('is-open');
            other.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
          }
        });
      }

      item.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', !isOpen);
    });
  });

  // 5. Sample Prompt Chips in Discovery
  const promptChips = document.querySelectorAll('.prompt-chip');
  const discoveryInput = document.getElementById('discoveryInput');

  promptChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const promptText = chip.getAttribute('data-prompt') || chip.textContent.replace(/"/g, '').trim();
      if (discoveryInput) {
        discoveryInput.value = promptText;
        discoveryInput.focus();
        // Smooth scroll to discovery box if needed
        discoveryInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // 6. Escape Key Listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navDropdowns.forEach(d => {
        d.classList.remove('is-open');
        d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
      });
      if (navMenu && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        mobileToggle?.setAttribute('aria-expanded', 'false');
        mobileToggle?.focus();
      }
    }
  });
});
