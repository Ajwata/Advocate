const revealItems = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

menuToggle?.addEventListener('click', () => {
  const isOpen = nav?.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('a[href="#hero"], a[href="#top"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetSelector = link.getAttribute('href');
    if (!targetSelector) return;
    const target = document.querySelector(targetSelector);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', targetSelector);
  });
});

document.addEventListener('click', (event) => {
  if (!nav || !menuToggle) return;
  const clickTarget = event.target;
  if (!(clickTarget instanceof Node)) return;

  const clickedInsideHeader = nav.contains(clickTarget) || menuToggle.contains(clickTarget);
  if (!clickedInsideHeader) {
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

const floatingContact = document.getElementById('floating-contact');
const floatingContactToggle = document.getElementById('floating-contact-toggle');

floatingContactToggle?.addEventListener('click', () => {
  if (!floatingContact) return;
  const isOpen = floatingContact.classList.toggle('is-open');
  floatingContactToggle.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', (event) => {
  if (!floatingContact || !floatingContactToggle) return;
  const clickTarget = event.target;
  if (!(clickTarget instanceof Node)) return;
  if (!floatingContact.contains(clickTarget)) {
    floatingContact.classList.remove('is-open');
    floatingContactToggle.setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!floatingContact || !floatingContactToggle) return;
  floatingContact.classList.remove('is-open');
  floatingContactToggle.setAttribute('aria-expanded', 'false');
});

const formSuccessByType = {
  'new-client': 'Дякуємо! Для вас зафіксовано знижку 15% як для нового клієнта.',
  pensioner: 'Заявка прийнята. Для пенсіонерів діє знижка 15%, скоро зателефонуємо.',
  military: 'Заявку для військових отримано. Пріоритетний дзвінок та знижка 15% активовано.',
};

const TELEGRAM_BOT_TOKEN = '8651844927:AAEmHoPrQoZSDOD_C5cyQ3wnelXnjxQ3Nb4';
const TELEGRAM_CHAT_ID = '7676843570';

const formTypeLabel = {
  'new-client': 'Новий клієнт',
  pensioner: 'Пенсіонер',
  military: 'Військовий/ветеран',
};

const sendLeadToTelegram = async (payload) => {
  const endpoint = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const text = [
    'Nova zayavka z saytu',
    `Forma: ${formTypeLabel[payload.formType] || payload.formType}`,
    `Imya: ${payload.name}`,
    `Telefon: ${payload.phone}`,
    `Povidomlennya: ${payload.message}`,
    `Storinka: ${payload.source}`,
    `Chas: ${payload.createdAt}`,
  ].join('\n');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      disable_web_page_preview: true,
    }),
  });

  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.description || 'Telegram send failed');
  }
};

const allForms = document.querySelectorAll('.js-lead-form');

allForms.forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nameField = form.querySelector('input[name="name"]');
    const phoneField = form.querySelector('input[name="phone"]');
    const messageField = form.querySelector('textarea[name="message"]');
    const formMessage = form.querySelector('.form-message');
    const nameValue = nameField?.value.trim() || '';
    const phoneValue = phoneField?.value.trim() || '';
    const messageValue = messageField?.value.trim() || '';

    if (!formMessage) {
      return;
    }

    if (nameValue.length < 2) {
      formMessage.textContent = 'Вкажіть, будь ласка, ваше ім\'я.';
      formMessage.style.color = '#b42318';
      return;
    }

    if (phoneValue.length < 10) {
      formMessage.textContent = 'Вкажіть коректний номер телефону.';
      formMessage.style.color = '#b42318';
      return;
    }

    if (messageValue.length < 5) {
      formMessage.textContent = 'Опишіть коротко ваше питання.';
      formMessage.style.color = '#b42318';
      return;
    }

    const type = form.dataset.formType || 'new-client';

    // Payload is ready for future Telegram API integration.
    const telegramPayload = {
      formType: type,
      name: nameValue,
      phone: phoneValue,
      message: messageValue,
      createdAt: new Date().toISOString(),
      source: window.location.href,
    };

    window.lastLeadPayload = telegramPayload;

    try {
      await sendLeadToTelegram(telegramPayload);
      formMessage.textContent =
        formSuccessByType[type] || 'Дякуємо! Ми зв\'яжемося з вами найближчим часом.';
      formMessage.style.color = '#1a7f37';
      form.reset();
    } catch (error) {
      console.error(error);
      formMessage.textContent = 'Не вдалося відправити заявку. Спробуйте ще раз або зателефонуйте.';
      formMessage.style.color = '#b42318';
    }
  });
});

const reviewsCarousel = document.getElementById('reviews-carousel');

if (reviewsCarousel) {
  const track = reviewsCarousel.querySelector('.reviews-track');
  const prevButton = reviewsCarousel.querySelector('.reviews-nav-prev');
  const nextButton = reviewsCarousel.querySelector('.reviews-nav-next');
  const dotsWrap = document.getElementById('reviews-dots');
  const slides = Array.from(track?.children || []);
  let activeIndex = 0;

  const updateDots = () => {
    if (!dotsWrap) return;
    const dots = dotsWrap.querySelectorAll('.review-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  };

  const goToSlide = (index) => {
    if (!track || !slides.length) return;
    const maxIndex = slides.length - 1;
    activeIndex = Math.max(0, Math.min(index, maxIndex));
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track).columnGap || '0');
    track.scrollTo({ left: activeIndex * (slideWidth + gap), behavior: 'smooth' });
    updateDots();
  };

  if (dotsWrap) {
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `review-dot${index === 0 ? ' active' : ''}`;
      dot.type = 'button';
      dot.setAttribute('aria-label', `Перейти до відгуку ${index + 1}`);
      dot.addEventListener('click', () => goToSlide(index));
      dotsWrap.appendChild(dot);
    });
  }

  prevButton?.addEventListener('click', () => goToSlide(activeIndex - 1));
  nextButton?.addEventListener('click', () => goToSlide(activeIndex + 1));

  let touchStartX = 0;
  track?.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  });

  track?.addEventListener('touchend', (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const delta = touchStartX - touchEndX;

    if (Math.abs(delta) < 40) return;
    if (delta > 0) {
      goToSlide(activeIndex + 1);
    } else {
      goToSlide(activeIndex - 1);
    }
  });
}
