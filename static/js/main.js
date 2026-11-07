/**
 * Words For It — Core Interactive Script
 * Accessible navigation, sample prompt triggers, and keyboard shortcuts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', (event) => {
      if (!navMenu.contains(event.target) && !mobileToggle.contains(event.target)) {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. Sample Prompt Chip Click Handlers
  const promptChips = document.querySelectorAll('.prompt-chip');
  const discoveryInput = document.getElementById('discoveryInput');

  promptChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const promptText = chip.getAttribute('data-prompt') || chip.textContent.replace(/"/g, '').trim();
      if (discoveryInput) {
        discoveryInput.value = promptText;
        discoveryInput.focus();
      }
    });
  });

  // 3. Escape key closes open menus
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.focus();
      }
    }
  });
});
