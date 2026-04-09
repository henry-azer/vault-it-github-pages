/* ============================================================
   Vault It — Shared JavaScript
   Dark mode, carousel, mobile nav, scroll animations, form router
   ============================================================ */

/* ----------------------------------------------------------
   1. Dark Mode Toggle (IIFE — runs immediately)
   ---------------------------------------------------------- */
(function initTheme() {
  var saved = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLogos);
  } else {
    updateLogos();
  }
})();

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateLogos();
}

function updateLogos() {
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var logos = document.querySelectorAll('[data-logo]');
  for (var i = 0; i < logos.length; i++) {
    logos[i].src = isDark ? 'assets/logo-dark.png' : 'assets/logo-light.png';
  }
}

/* ----------------------------------------------------------
   2. Mobile Nav
   ---------------------------------------------------------- */
function toggleMobileNav() {
  var menu = document.querySelector('.nav__mobile-menu');
  if (menu) menu.classList.toggle('active');
  document.body.classList.toggle('nav-open');
}

function closeMobileNav() {
  var menu = document.querySelector('.nav__mobile-menu');
  if (menu) menu.classList.remove('active');
  document.body.classList.remove('nav-open');
}

/* ----------------------------------------------------------
   3. Carousel Engine
   ---------------------------------------------------------- */
function initCarousels() {
  var carousels = document.querySelectorAll('.carousel');

  for (var c = 0; c < carousels.length; c++) {
    (function (carousel) {
      var track = carousel.querySelector('.carousel__track');
      var slides = carousel.querySelectorAll('.carousel__slide');
      var dots = carousel.querySelectorAll('.carousel__dot');
      if (!track || slides.length === 0) return;

      var current = 0;
      var total = slides.length;
      var autoInterval = null;
      var touchStartX = 0;
      var touchEndX = 0;

      function goTo(index) {
        current = ((index % total) + total) % total;
        track.style.transform = 'translateX(-' + current * 100 + '%)';
        for (var d = 0; d < dots.length; d++) {
          dots[d].classList.toggle('active', d === current);
        }
      }

      function next() {
        goTo(current + 1);
      }

      function startAuto() {
        stopAuto();
        autoInterval = setInterval(next, 4000);
      }

      function stopAuto() {
        if (autoInterval) {
          clearInterval(autoInterval);
          autoInterval = null;
        }
      }

      // Dot clicks
      for (var d = 0; d < dots.length; d++) {
        (function (idx) {
          dots[idx].addEventListener('click', function () {
            goTo(idx);
          });
        })(d);
      }

      // Pause on hover
      carousel.addEventListener('mouseenter', stopAuto);
      carousel.addEventListener('mouseleave', startAuto);

      // Touch swipe
      carousel.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      carousel.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            goTo(current + 1);
          } else {
            goTo(current - 1);
          }
        }
      }, { passive: true });

      // Init
      goTo(0);
      startAuto();
    })(carousels[c]);
  }
}

/* ----------------------------------------------------------
   4. Scroll Animations
   ---------------------------------------------------------- */
function initScrollAnimations() {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  var targets = document.querySelectorAll('.fade-in');
  if (targets.length === 0) return;

  var observer = new IntersectionObserver(function (entries, obs) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add('visible');
        obs.unobserve(entries[i].target);
      }
    }
  }, { threshold: 0.1 });

  for (var i = 0; i < targets.length; i++) {
    observer.observe(targets[i]);
  }
}

/* ----------------------------------------------------------
   5. Support Form Router
   ---------------------------------------------------------- */
var FORM_CONFIG = {
  help: {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSd0O2cl3-oreDnkc0TCqxjYL-y_mBCZnLTgIwg8wRKmCBvkuA/formResponse',
    appField: 'entry.404388434',
    nameField: 'entry.485428648',
    subjectField: 'entry.879531967',
    descField: 'entry.326955045'
  },
  bug: {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSdF9tzd8VD0V8cDeMFCkaOGgguIw5oiWSvFT4EZQjClzKn5_A/formResponse',
    appField: 'entry.2032870792',
    nameField: 'entry.1263596795',
    subjectField: 'entry.1386997470',
    descField: 'entry.326955045'
  },
  feedback: {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSc30DiuLt9yw8Eo5vmBWOA3DQXt3cFQsgVpKBrNmddKv-SmMg/formResponse',
    appField: 'entry.1209049190',
    nameField: 'entry.485428648',
    ratingField: 'entry.1696159737',
    descField: 'entry.326955045'
  }
};

function initSupportForm() {
  var pills = document.querySelectorAll('.pill[data-type]');
  var sections = document.querySelectorAll('.form-section[data-section]');
  var form = document.querySelector('.support-form');
  if (pills.length === 0 && !form) return;

  var activeType = 'help';

  function switchType(type) {
    activeType = type;
    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.toggle('active', pills[i].getAttribute('data-type') === type);
    }
    for (var j = 0; j < sections.length; j++) {
      var sectionType = sections[j].getAttribute('data-section');
      sections[j].style.display = sectionType === type ? '' : 'none';
    }
  }

  // Pill click handlers
  for (var p = 0; p < pills.length; p++) {
    (function (pill) {
      pill.addEventListener('click', function () {
        switchType(pill.getAttribute('data-type'));
      });
    })(pills[p]);
  }

  // Init first type
  switchType(activeType);

  // Form submit
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var config = FORM_CONFIG[activeType];
      if (!config) return;

      // Validate required fields
      var hasError = false;
      var groups = form.querySelectorAll('.form-group');
      for (var g = 0; g < groups.length; g++) {
        groups[g].classList.remove('has-error');
      }

      var visibleSection = form.querySelector('.form-section[data-section="' + activeType + '"]') || form;
      var requiredInputs = visibleSection.querySelectorAll('[required]');
      for (var r = 0; r < requiredInputs.length; r++) {
        var input = requiredInputs[r];
        var value = input.value ? input.value.trim() : '';
        if (!value) {
          var group = input.closest('.form-group');
          if (group) group.classList.add('has-error');
          hasError = true;
        }
      }

      // Feedback rating validation
      if (activeType === 'feedback') {
        var ratingChecked = form.querySelector('input[name="rating"]:checked');
        if (!ratingChecked) {
          var ratingGroup = form.querySelector('input[name="rating"]');
          if (ratingGroup) {
            var rg = ratingGroup.closest('.form-group');
            if (rg) rg.classList.add('has-error');
          }
          hasError = true;
        }
      }

      if (hasError) return;

      // Build form data
      var data = {};
      data[config.appField] = 'Vault It';

      if (config.nameField) {
        var nameInput = form.querySelector('[data-field="name"]');
        if (nameInput) data[config.nameField] = nameInput.value.trim();
      }

      if (config.subjectField) {
        var subjectInput = form.querySelector('[data-field="subject"]');
        if (subjectInput) data[config.subjectField] = subjectInput.value.trim();
      }

      if (config.ratingField) {
        var ratingInput = form.querySelector('input[name="rating"]:checked');
        if (ratingInput) data[config.ratingField] = ratingInput.value;
      }

      if (config.descField) {
        var descInput = form.querySelector('[data-field="description"]');
        if (descInput) data[config.descField] = descInput.value.trim();
      }

      // Submit via hidden iframe + temp form
      var iframeName = 'support-form-iframe';
      var iframe = document.querySelector('iframe[name="' + iframeName + '"]');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.name = iframeName;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }

      var tempForm = document.createElement('form');
      tempForm.method = 'POST';
      tempForm.action = config.url;
      tempForm.target = iframeName;
      tempForm.style.display = 'none';

      var keys = Object.keys(data);
      for (var k = 0; k < keys.length; k++) {
        var hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = keys[k];
        hidden.value = data[keys[k]];
        tempForm.appendChild(hidden);
      }

      document.body.appendChild(tempForm);
      tempForm.submit();
      document.body.removeChild(tempForm);

      // Success feedback
      showToast('Thank you! Your message has been sent.');

      // Reset form fields
      var allInputs = form.querySelectorAll('input:not([type="radio"]):not([type="hidden"]), textarea, select');
      for (var a = 0; a < allInputs.length; a++) {
        allInputs[a].value = '';
      }
      var radios = form.querySelectorAll('input[type="radio"]');
      for (var rd = 0; rd < radios.length; rd++) {
        radios[rd].checked = false;
      }
    });
  }
}

/* ----------------------------------------------------------
   Toast
   ---------------------------------------------------------- */
function showToast(message) {
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add('show');
  });

  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, 3500);
}

/* ----------------------------------------------------------
   6. Init
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  initCarousels();
  initScrollAnimations();
  initSupportForm();
});
