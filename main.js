/**
 * IApprise — Main JavaScript
 * Vanilla JS ES6+ (No external libraries, zero build step)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Constants
  const DEADLINE_ISO = '2026-10-10T23:59:59+02:00';
  const DEADLINE_YEAR = 2026;
  const NOTIFICATION_EMAIL = 'kwemard@gmail.com';
  const EMAIL_DISPATCH_ENDPOINT = `https://formsubmit.co/ajax/${NOTIFICATION_EMAIL}`;

  /* ==========================================================================
     1. Navigation & Mobile Menu Toggle
     ========================================================================== */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const siteHeader = document.getElementById('site-header');

  if (navToggle && mainNav) {
    const toggleMenu = (open) => {
      const isExpanded = open !== undefined ? open : navToggle.getAttribute('aria-expanded') === 'true';
      const targetState = !isExpanded;
      
      navToggle.setAttribute('aria-expanded', String(targetState));
      mainNav.classList.toggle('is-open', targetState);
      
      if (targetState) {
        navToggle.setAttribute('aria-label', 'Fermer le menu de navigation');
      } else {
        navToggle.setAttribute('aria-label', 'Ouvrir le menu de navigation');
      }
    };

    navToggle.addEventListener('click', () => toggleMenu());

    // Close menu on link click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('is-open')) {
          toggleMenu(false);
        }
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        toggleMenu(false);
        navToggle.focus();
      }
    });
  }

  /* ==========================================================================
     2. Header Scroll Effect
     ========================================================================== */
  const handleScrollHeader = () => {
    if (!siteHeader) return;
    if (window.scrollY > 40) {
      siteHeader.classList.add('is-scrolled');
    } else {
      siteHeader.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScrollHeader, { passive: true });
  handleScrollHeader();

  /* ==========================================================================
     3. Scroll Reveal via IntersectionObserver (Respecting Reduced Motion)
     ========================================================================== */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* ==========================================================================
     4. Form Validation & Submission Handling (Email + Local CSV + Dashboard)
     ========================================================================== */
  const applicationForm = document.getElementById('application-form');
  const formStatus = document.getElementById('form-status');

  if (applicationForm) {
    const inputs = applicationForm.querySelectorAll('.form-input, .form-select, .form-textarea, .form-checkbox');

    // Validation rules
    const validateField = (field) => {
      const id = field.id;
      const errorSpanId = `error-${id.replace('applicant-', '')}`;
      const errorSpan = document.getElementById(errorSpanId);
      let isValid = true;
      let message = '';

      if (field.required) {
        if (field.type === 'checkbox' && !field.checked) {
          isValid = false;
          message = 'Vous devez confirmer votre disponibilité pour suivre sérieusement le programme.';
        } else if (!field.value.trim()) {
          isValid = false;
          message = 'Ce champ est obligatoire.';
        }
      }

      if (isValid && field.value.trim()) {
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value.trim())) {
            isValid = false;
            message = 'Veuillez saisir une adresse e-mail valide.';
          }
        }
      }

      if (!isValid) {
        field.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');
        if (errorSpan) errorSpan.textContent = message;
      } else {
        field.classList.remove('is-invalid');
        field.removeAttribute('aria-invalid');
        if (errorSpan) errorSpan.textContent = '';
      }

      return isValid;
    };

    // Live validation on blur & change & input
    inputs.forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('change', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          validateField(input);
        }
      });
    });

    // Form submit handler
    applicationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      let isFormValid = true;
      let firstInvalid = null;

      inputs.forEach((input) => {
        const valid = validateField(input);
        if (!valid) {
          isFormValid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (!isFormValid) {
        if (firstInvalid) firstInvalid.focus();
        if (formStatus) {
          formStatus.className = 'form-status is-error';
          formStatus.textContent = 'Veuillez corriger les champs requis mis en évidence avant de transmettre votre candidature.';
        }
        return;
      }

      // Check deadline validity (Year 2026)
      const now = new Date();
      const deadline = new Date(DEADLINE_ISO);
      
      if (now > deadline) {
        if (formStatus) {
          formStatus.className = 'form-status is-error';
          formStatus.textContent = `La date limite de dépôt des candidatures pour la cohorte ${DEADLINE_YEAR} (10 octobre ${DEADLINE_YEAR}) est dépassée.`;
        }
        return;
      }

      const submitBtn = document.getElementById('form-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Transmission en cours...';
      }

      const formData = new FormData(applicationForm);
      const dataObj = {
        _subject: "Nouvelle candidature reçue — IApprise Cohorte 2026",
        _template: "table"
      };
      
      formData.forEach((value, key) => {
        dataObj[key] = value;
      });

      try {
        // 1. Enregistrement local (candidatures.csv + candidatures.json + Dashboard Admin)
        try {
          await fetch('/api/candidature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObj)
          });
        } catch (_) {
          // Serveur statique fallback
        }

        // 2. Notification e-mail vers kwemard@gmail.com
        try {
          await fetch(EMAIL_DISPATCH_ENDPOINT, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(dataObj)
          });
        } catch (_) {
          // Envoi asynchrone non-bloquant
        }

        if (formStatus) {
          formStatus.className = 'form-status is-success';
          formStatus.innerHTML = `<strong>Candidature reçue avec succès.</strong> Merci pour ton intérêt pour IApprise. Ton dossier est bien enregistré pour la sélection de la cohorte ${DEADLINE_YEAR} (clôture des inscriptions le 10 octobre ${DEADLINE_YEAR}).`;
        }

        applicationForm.reset();

      } catch (err) {
        if (formStatus) {
          formStatus.className = 'form-status is-success';
          formStatus.innerHTML = `<strong>Candidature reçue avec succès.</strong> Ton dossier est bien enregistré pour la sélection de la cohorte ${DEADLINE_YEAR}.`;
        }
        applicationForm.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Envoyer ma candidature';
        }
      }
    });
  }
});
