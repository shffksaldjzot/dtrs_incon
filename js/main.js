/* ===========================
   DOTORI STUDIO - Main JS
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- LOADING SCREEN ----------
  const loadingScreen = document.getElementById('loadingScreen');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 800);
  });
  // Fallback: hide after 2.5s even if load event doesn't fire
  setTimeout(() => { loadingScreen.classList.add('hidden'); }, 2500);

  // ---------- HEADER SCROLL ----------
  const header = document.getElementById('header');
  const floatingCta = document.getElementById('floatingCta');
  const backToTop = document.getElementById('backToTop');
  const mobileCTABar = document.getElementById('mobileCTABar');
  const shareBtn = document.getElementById('shareBtn');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header background
    if (scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Floating CTA visibility
    if (scrollY > 500) {
      floatingCta.classList.add('visible');
      backToTop.classList.add('visible');
      mobileCTABar.classList.add('visible');
      shareBtn.classList.add('visible');
    } else {
      floatingCta.classList.remove('visible');
      backToTop.classList.remove('visible');
      mobileCTABar.classList.remove('visible');
      shareBtn.classList.remove('visible');
    }
  });

  // ---------- BACK TO TOP ----------
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- MOBILE MENU ----------
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');

  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    mobileNavOverlay.classList.toggle('active');
    document.body.style.overflow = mobileNavOverlay.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  mobileNavOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('active');
      mobileNavOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ---------- SMOOTH SCROLL ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = header.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---------- SCROLL ANIMATIONS (Intersection Observer) ----------
  const fadeElements = document.querySelectorAll('.fade-up');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeElements.forEach(el => fadeObserver.observe(el));

  // ---------- COUNTER ANIMATION ----------
  const counters = document.querySelectorAll('.counter');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.dataset.target);
        const duration = 2500;
        const start = performance.now();

        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.round(target * eased);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  // ---------- SITUATION CARDS (Accordion) ----------
  const situationCards = document.querySelectorAll('.situation-card');

  situationCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't toggle if clicking a button/link inside
      if (e.target.closest('a')) return;

      const isActive = card.classList.contains('active');

      // Close all
      situationCards.forEach(c => c.classList.remove('active'));

      // Toggle current
      if (!isActive) {
        card.classList.add('active');
      }
    });
  });

  // ---------- FAQ ACCORDION ----------
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(i => i.classList.remove('active'));

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // ---------- RIPPLE EFFECT ----------
  document.querySelectorAll('.btn-ripple').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

      this.appendChild(ripple);

      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    });
  });

  // ---------- FORM SUBMISSION (Google Forms) ----------
  const form = document.getElementById('consultForm');
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/1GMtkv3AIvCl5XvQKULPYreiIyGiZitcerYN8S_r3dig/formResponse';

  // Google Forms entry IDs (inner field IDs from data-params)
  const ENTRY_IDS = {
    name: 'entry.1750516445',
    phone: 'entry.943515076',
    location: 'entry.1680683942',
    space_type: 'entry.271598067',
    stage: 'entry.670292362',
    area: 'entry.1475256016',
    concern: 'entry.1363863516',
    docs: 'entry.1091142326',
    schedule: 'entry.19501128',
    extra: 'entry.69819870'
  };

  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;
    isSubmitting = true;

    // Validate required fields
    const nameInput = document.getElementById('f-name');
    const phoneInput = document.getElementById('f-phone');
    let hasError = false;

    // Clear previous errors
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.form-error-msg').forEach(el => el.remove());

    if (!nameInput.value.trim()) {
      nameInput.classList.add('error');
      const msg = document.createElement('div');
      msg.className = 'form-error-msg';
      msg.textContent = '이름을 입력해주세요.';
      nameInput.parentElement.appendChild(msg);
      hasError = true;
    }

    if (!phoneInput.value.trim()) {
      phoneInput.classList.add('error');
      const msg = document.createElement('div');
      msg.className = 'form-error-msg';
      msg.textContent = '연락처를 입력해주세요.';
      phoneInput.parentElement.appendChild(msg);
      hasError = true;
    }

    const locationInput = document.getElementById('f-location');
    if (!locationInput.value.trim()) {
      locationInput.classList.add('error');
      const msg = document.createElement('div');
      msg.className = 'form-error-msg';
      msg.textContent = '지역 / 현장 위치를 입력해주세요.';
      locationInput.parentElement.appendChild(msg);
      hasError = true;
    }

    const agreeCheckbox = document.getElementById('f-agree');
    if (!agreeCheckbox.checked) {
      agreeCheckbox.closest('.checkbox-agreement').classList.add('error');
      const msg = document.createElement('div');
      msg.className = 'form-error-msg';
      msg.textContent = '동의 후 제출할 수 있습니다.';
      agreeCheckbox.closest('.form-agreement').appendChild(msg);
      hasError = true;
    }

    if (hasError) {
      isSubmitting = false;
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Get submit button
    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Collect form data
    const spaceType = form.querySelector('input[name="space_type"]:checked');
    const stage = form.querySelector('input[name="stage"]:checked');
    const area = form.querySelector('input[name="area"]:checked');
    const docs = form.querySelectorAll('input[name="docs"]:checked');
    const schedule = form.querySelector('input[name="schedule"]:checked');

    const formPayload = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      location: document.getElementById('f-location').value.trim(),
      space_type: spaceType ? spaceType.value : '',
      stage: stage ? stage.value : '',
      area: area ? area.value : '',
      concern: document.getElementById('f-concern').value.trim(),
      docs: Array.from(docs).map(d => d.value),
      schedule: schedule ? schedule.value : '',
      extra: document.getElementById('f-extra').value.trim()
    };

    // Submit via API (Google Forms + Slack notification)
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPayload)
      });

      // Success - show modal
      submitBtn.classList.remove('loading');
      submitBtn.classList.add('success');
      showSuccessModal();

      // Reset form
      setTimeout(() => {
        form.reset();
        submitBtn.classList.remove('success');
        submitBtn.disabled = false;
        isSubmitting = false;
      }, 1500);

    } catch (err) {
      submitBtn.classList.remove('loading');
      submitBtn.classList.add('success');
      showSuccessModal();

      setTimeout(() => {
        form.reset();
        submitBtn.classList.remove('success');
        submitBtn.disabled = false;
        isSubmitting = false;
      }, 1500);
    }
  });

  // ---------- SUCCESS MODAL ----------
  const successModal = document.getElementById('successModal');
  const successModalClose = document.getElementById('successModalClose');
  const successBackdrop = successModal.querySelector('.success-modal-backdrop');

  function showSuccessModal() {
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideSuccessModal() {
    successModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  successModalClose.addEventListener('click', hideSuccessModal);
  successBackdrop.addEventListener('click', hideSuccessModal);

  // Phone number auto-format (010-0000-0000)
  const phoneInput2 = document.getElementById('f-phone');
  phoneInput2.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 7) {
      value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
    } else if (value.length > 3) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    }

    e.target.value = value;
  });

  // Real-time validation clear
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errorMsg = input.parentElement.querySelector('.form-error-msg');
      if (errorMsg) errorMsg.remove();
    });
  });

  // Agreement checkbox validation clear
  document.getElementById('f-agree').addEventListener('change', function() {
    if (this.checked) {
      this.closest('.checkbox-agreement').classList.remove('error');
      const errorMsg = this.closest('.form-agreement').querySelector('.form-error-msg');
      if (errorMsg) errorMsg.remove();
    }
  });

  // ---------- SHARE BUTTON ----------
  const shareMenu = document.getElementById('shareMenu');

  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    shareMenu.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    shareMenu.classList.remove('active');
  });

  document.getElementById('shareCopy').addEventListener('click', () => {
    navigator.clipboard.writeText('https://dtrs-incon.com').then(() => {
      const btn = document.getElementById('shareCopy');
      btn.textContent = '복사 완료!';
      setTimeout(() => { btn.textContent = '링크 복사'; }, 2000);
    });
    shareMenu.classList.remove('active');
  });

  document.getElementById('shareKakao').addEventListener('click', () => {
    const url = 'https://dtrs-incon.com';
    window.open('https://story.kakao.com/share?url=' + encodeURIComponent(url), '_blank', 'width=500,height=600');
    shareMenu.classList.remove('active');
  });

  // ---------- REVIEW SLIDER (Mobile) ----------
  const reviewSlider = document.getElementById('reviewSlider');
  const reviewDots = document.getElementById('reviewDots');

  if (reviewSlider && reviewDots) {
    const cards = reviewSlider.querySelectorAll('.review-card');
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'review-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => {
        cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      });
      reviewDots.appendChild(dot);
    });

    const dots = reviewDots.querySelectorAll('.review-dot');
    reviewSlider.addEventListener('scroll', () => {
      const scrollLeft = reviewSlider.scrollLeft;
      const cardWidth = cards[0].offsetWidth + 24;
      const activeIndex = Math.round(scrollLeft / cardWidth);
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
      });
    });
  }

  // ---------- MOBILE CTA BAR smooth scroll ----------
  const mobileFormBtn = mobileCTABar.querySelector('.mobile-cta-form');
  if (mobileFormBtn) {
    mobileFormBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#contact');
      const offset = header.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }

});
