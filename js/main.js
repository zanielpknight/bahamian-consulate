(function() {
  'use strict';

  /* ==========================================================================
     1. NAV SCROLL STATE
     ========================================================================== */

  var nav = document.getElementById('nav');
  var scrollTicking = false;

  function updateNavScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
    scrollTicking = false;
  }

  if (nav) {
    // Subpages get the scrolled style immediately
    if (document.body.classList.contains('subpage')) {
      nav.classList.add('nav-scrolled');
    }

    window.addEventListener('scroll', function() {
      if (!scrollTicking) {
        requestAnimationFrame(updateNavScroll);
        scrollTicking = true;
      }
    });

    // Set initial state on load
    updateNavScroll();
  }


  /* ==========================================================================
     2. MOBILE MENU TOGGLE
     ========================================================================== */

  var toggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  function openMobileMenu() {
    toggle.classList.add('active');
    mobileMenu.classList.add('active');
    document.body.classList.add('overflow-hidden');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    toggle.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function() {
      var isOpen = toggle.classList.contains('active');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close when a link inside the mobile menu is clicked
    var mobileLinks = mobileMenu.querySelectorAll('a');
    for (var i = 0; i < mobileLinks.length; i++) {
      mobileLinks[i].addEventListener('click', closeMobileMenu);
    }

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
        toggle.focus();
      }
    });
  }


  /* ==========================================================================
     3. SCROLL REVEAL
     ========================================================================== */

  var revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    for (var r = 0; r < revealElements.length; r++) {
      revealObserver.observe(revealElements[r]);
    }
  } else {
    // Fallback: show everything immediately
    for (var f = 0; f < revealElements.length; f++) {
      revealElements[f].classList.add('visible');
    }
  }


  /* ==========================================================================
     4. ACCORDION (Services page)
     ========================================================================== */

  var accordionTriggers = document.querySelectorAll('.accordion-trigger');

  function toggleAccordion(trigger) {
    var item = trigger.closest('.accordion-item');
    var content = item.querySelector('.accordion-content');
    var isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      // Collapse
      trigger.setAttribute('aria-expanded', 'false');
      item.classList.remove('active');
      content.style.maxHeight = '0';
    } else {
      // Expand
      trigger.setAttribute('aria-expanded', 'true');
      item.classList.add('active');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  }

  for (var a = 0; a < accordionTriggers.length; a++) {
    // Click handler
    accordionTriggers[a].addEventListener('click', function() {
      toggleAccordion(this);
    });

    // Keyboard handler: Enter and Space
    accordionTriggers[a].addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAccordion(this);
      }
    });
  }


  /* ==========================================================================
     5. ACTIVE NAV INDICATOR
     ========================================================================== */

  var currentPath = window.location.pathname;
  var currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

  var navSelectors = ['.nav-links a', '.mobile-menu-nav a'];

  navSelectors.forEach(function(selector) {
    var links = document.querySelectorAll(selector);

    for (var n = 0; n < links.length; n++) {
      var href = links[n].getAttribute('href');
      var isMatch = false;

      if (href === currentPage) {
        isMatch = true;
      }

      // Match index.html with '/', '', or 'index.html'
      if ((currentPage === 'index.html' || currentPage === '' || currentPage === '/') &&
          (href === 'index.html' || href === '/' || href === '')) {
        isMatch = true;
      }

      if (isMatch) {
        links[n].classList.add('nav-active');
        links[n].setAttribute('aria-current', 'page');
      }
    }
  });


  /* ==========================================================================
     6. SKIP LINK FOCUS MANAGEMENT
     ========================================================================== */

  var skipLink = document.querySelector('a[href="#main-content"]');
  var mainContent = document.getElementById('main-content');

  if (skipLink && mainContent) {
    if (!mainContent.hasAttribute('tabindex')) {
      mainContent.setAttribute('tabindex', '-1');
    }

    skipLink.addEventListener('click', function(e) {
      e.preventDefault();
      mainContent.focus();
      window.scrollTo(0, mainContent.offsetTop);
    });
  }


  /* ==========================================================================
     7. SMOOTH SCROLL FOR HASH LINKS
     ========================================================================== */

  var NAV_OFFSET = 72;

  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;

    var targetId = link.getAttribute('href').substring(1);
    if (!targetId) return;

    var target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    var top = target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;

    window.scrollTo({
      top: top,
      behavior: 'smooth'
    });

    // Move focus to target for accessibility
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });


  /* ==========================================================================
     8. PAYMENT FORM INTERACTIONS (payments page)
     ========================================================================== */

  var paymentForm = document.getElementById('payment-form');
  var serviceSelect = document.getElementById('service-select');
  var amountField = document.getElementById('payment-amount');
  var amountDisplay = document.getElementById('payment-amount-display');
  var cardNumberField = document.getElementById('card-number');
  var expiryField = document.getElementById('card-expiry');
  var cvvField = document.getElementById('card-cvv');

  // Service selection auto-populates amount
  if (serviceSelect) {
    serviceSelect.addEventListener('change', function() {
      var selected = serviceSelect.options[serviceSelect.selectedIndex];
      var price = selected.getAttribute('data-price') || '';
      if (amountField) {
        amountField.value = price;
      }
      if (amountDisplay) {
        amountDisplay.textContent = price ? '$' + parseFloat(price).toFixed(2) : '$0.00';
      }
    });
  }

  // Card number formatting: spaces every 4 digits
  if (cardNumberField) {
    cardNumberField.addEventListener('input', function() {
      var value = this.value.replace(/\D/g, '').substring(0, 16);
      var formatted = value.replace(/(.{4})/g, '$1 ').trim();
      this.value = formatted;
    });
  }

  // Expiry date auto-format: MM/YY with auto-slash
  if (expiryField) {
    expiryField.addEventListener('input', function() {
      var value = this.value.replace(/\D/g, '').substring(0, 4);
      if (value.length >= 3) {
        this.value = value.substring(0, 2) + '/' + value.substring(2);
      } else {
        this.value = value;
      }
    });
  }

  // CVV max length
  if (cvvField) {
    cvvField.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').substring(0, 4);
    });
  }

  // Payment form submit placeholder
  if (paymentForm) {
    paymentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Payment processing is not yet available. Please contact the Consulate directly.');
    });
  }


  /* ==========================================================================
     9. APPOINTMENT FORM (contact page)
     ========================================================================== */

  var appointmentForm = document.getElementById('appointment-form');

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Your appointment request has been received. The Consulate will contact you shortly.');
    });
  }

})();
