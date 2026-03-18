const revealItems = document.querySelectorAll('.reveal');
const preloader = document.getElementById('preloader');
const TEXT_ADMIN_STORAGE_KEY = 'kla_text_admin_v1';
const TEXT_ADMIN_REMOTE_CONFIG_KEY = 'kla_text_admin_remote_v1';

const textEditorConfig = [
  { key: 'heroOverline', label: 'Hero: Малий заголовок', selector: '#hero .hero-content .overline' },
  { key: 'heroTitle', label: 'Hero: Головний заголовок', selector: '#hero .hero-content h1' },
  { key: 'heroSubtitle', label: 'Hero: Підзаголовок', selector: '#hero .hero-content .hero-subtitle' },
  { key: 'heroCta', label: 'Hero: Кнопка', selector: '#hero .hero-mobile-cta-wrap .cta-btn' },
  { key: 'urgentOverline', label: 'Термінова допомога: Малий заголовок', selector: '.cta-band.section-muted .cta-band-content .overline' },
  { key: 'urgentTitle', label: 'Термінова допомога: Заголовок', selector: '.cta-band.section-muted .cta-band-content h2' },
  { key: 'urgentText', label: 'Термінова допомога: Текст', selector: '.cta-band.section-muted .cta-band-content > p' },
  { key: 'urgentBtnPrimary', label: 'Термінова допомога: Кнопка 1', selector: '.cta-band.section-muted .cta-band-actions .cta-btn.cta-btn-lg' },
  { key: 'urgentBtnPhone', label: 'Термінова допомога: Кнопка 2', selector: '.cta-band.section-muted .cta-band-actions .cta-btn-outline' },
  { key: 'urgentBadge', label: 'Термінова допомога: Бейдж фото', selector: '.cta-band-photo-badge' },
  { key: 'videosTitle', label: 'Секція: Відео', selector: '#videos .section-head h2' },
  { key: 'casesTitle', label: 'Секція: Кейси', selector: '#cases .section-head h2' },
  { key: 'whyTitle', label: 'Секція: Переваги', selector: '#why-us .section-head h2' },
  { key: 'reviewsTitle', label: 'Секція: Відгуки', selector: '#reviews .section-head h2' },
  { key: 'militaryTitle', label: 'Секція: Військовим', selector: '#military .section-head h2' },
  { key: 'militaryFormTitle', label: 'Форма військових: Заголовок', selector: '#military-form .section-head h2' },
  { key: 'militaryFormText', label: 'Форма військових: Підпис', selector: '#military-form .section-head .hero-subtitle' },
  { key: 'finalCtaOverline', label: 'Фінальний CTA: Малий заголовок', selector: 'main > .cta-band .overline' },
  { key: 'finalCtaTitle', label: 'Фінальний CTA: Заголовок', selector: 'main > .cta-band h2' },
  { key: 'finalCtaText', label: 'Фінальний CTA: Текст', selector: 'main > .cta-band p:not(.overline)' },
  { key: 'finalCtaBtn', label: 'Фінальний CTA: Кнопка', selector: 'main > .cta-band .cta-btn.cta-btn-lg' },
  { key: 'modalTitle', label: 'Попап: Заголовок', selector: '#lead-modal-title' },
  { key: 'modalText', label: 'Попап: Текст', selector: '#lead-modal-form p' },
];

const getStoredTexts = () => {
  try {
    return JSON.parse(localStorage.getItem(TEXT_ADMIN_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const getRemoteConfig = () => {
  try {
    return JSON.parse(localStorage.getItem(TEXT_ADMIN_REMOTE_CONFIG_KEY) || '{}');
  } catch {
    return {};
  }
};

const setRemoteConfig = (config) => {
  localStorage.setItem(TEXT_ADMIN_REMOTE_CONFIG_KEY, JSON.stringify(config));
};

const applyStoredTexts = () => {
  const stored = getStoredTexts();
  textEditorConfig.forEach((item) => {
    const target = document.querySelector(item.selector);
    const value = stored[item.key];
    if (!target || typeof value !== 'string') return;
    target.textContent = value;
  });
};

applyStoredTexts();

const initAdminPanel = () => {
  const panel = document.getElementById('admin-panel');
  const toggle = document.getElementById('admin-toggle');
  const close = document.getElementById('admin-panel-close');
  const fieldsWrap = document.getElementById('admin-fields');
  const saveButton = document.getElementById('admin-save');
  const resetButton = document.getElementById('admin-reset');
  const endpointInput = document.getElementById('admin-endpoint');
  const tokenInput = document.getElementById('admin-token');
  const loadRemoteButton = document.getElementById('admin-load-remote');
  const pushRemoteButton = document.getElementById('admin-push-remote');
  const status = document.getElementById('admin-status');

  if (!panel || !toggle || !close || !fieldsWrap || !saveButton || !resetButton || !status || !endpointInput || !tokenInput || !loadRemoteButton || !pushRemoteButton) {
    return;
  }

  const defaults = {};
  const inputsByKey = {};
  const targetsByKey = {};
  const stored = getStoredTexts();
  const remoteConfig = getRemoteConfig();

  endpointInput.value = typeof remoteConfig.endpoint === 'string' ? remoteConfig.endpoint : '';
  tokenInput.value = typeof remoteConfig.token === 'string' ? remoteConfig.token : '';

  const collectDataFromInputs = () => {
    const data = {};
    Object.entries(inputsByKey).forEach(([key, input]) => {
      data[key] = input.value;
    });
    return data;
  };

  const applyDataToUI = (data) => {
    Object.entries(inputsByKey).forEach(([key, input]) => {
      if (typeof data[key] !== 'string') return;
      input.value = data[key];
      const targetElement = targetsByKey[key];
      if (targetElement) {
        targetElement.textContent = data[key];
      }
    });
  };

  const readRemote = async () => {
    const endpoint = endpointInput.value.trim();
    const token = tokenInput.value.trim();
    if (!endpoint) {
      throw new Error('Вкажіть API Endpoint.');
    }

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers['X-API-Key'] = token;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.message || 'Не вдалося завантажити дані з API.');
    }

    return result?.texts || result?.data || result;
  };

  const writeRemote = async (texts) => {
    const endpoint = endpointInput.value.trim();
    const token = tokenInput.value.trim();
    if (!endpoint) {
      throw new Error('Вкажіть API Endpoint.');
    }

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers['X-API-Key'] = token;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ texts }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.message || 'Не вдалося опублікувати дані в API.');
    }

    return result;
  };

  textEditorConfig.forEach((item) => {
    const target = document.querySelector(item.selector);
    if (!target) return;

    const currentValue = target.textContent.trim();
    defaults[item.key] = currentValue;
    targetsByKey[item.key] = target;

    const field = document.createElement('div');
    field.className = 'admin-field';

    const label = document.createElement('label');
    label.setAttribute('for', `admin-field-${item.key}`);
    label.textContent = item.label;

    const textarea = document.createElement('textarea');
    textarea.id = `admin-field-${item.key}`;
    textarea.value = typeof stored[item.key] === 'string' ? stored[item.key] : currentValue;

    textarea.addEventListener('input', () => {
      const targetElement = targetsByKey[item.key];
      if (!targetElement) return;
      targetElement.textContent = textarea.value;
    });

    field.append(label, textarea);
    fieldsWrap.appendChild(field);
    inputsByKey[item.key] = textarea;
  });

  const openPanel = () => {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const closePanel = () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', openPanel);
  close.addEventListener('click', closePanel);

  const persistRemoteConfig = () => {
    setRemoteConfig({
      endpoint: endpointInput.value.trim(),
      token: tokenInput.value.trim(),
    });
  };

  endpointInput.addEventListener('change', persistRemoteConfig);
  tokenInput.addEventListener('change', persistRemoteConfig);

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.style.color = isError ? '#b42318' : '#1a7f37';
  };

  saveButton.addEventListener('click', () => {
    const data = collectDataFromInputs();

    localStorage.setItem(TEXT_ADMIN_STORAGE_KEY, JSON.stringify(data));
    persistRemoteConfig();
    setStatus('Зміни збережено локально.');
  });

  resetButton.addEventListener('click', () => {
    localStorage.removeItem(TEXT_ADMIN_STORAGE_KEY);
    Object.entries(inputsByKey).forEach(([key, input]) => {
      const fallback = defaults[key] || '';
      input.value = fallback;
      const targetElement = targetsByKey[key];
      if (targetElement) {
        targetElement.textContent = fallback;
      }
    });
    setStatus('Зміни скинуто.');
  });

  loadRemoteButton.addEventListener('click', async () => {
    setStatus('Завантаження з API...');
    try {
      persistRemoteConfig();
      const remoteData = await readRemote();
      if (!remoteData || typeof remoteData !== 'object') {
        throw new Error('API повернув некоректні дані.');
      }
      applyDataToUI(remoteData);
      localStorage.setItem(TEXT_ADMIN_STORAGE_KEY, JSON.stringify(collectDataFromInputs()));
      setStatus('Тексти завантажено з API.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Помилка завантаження з API.', true);
    }
  });

  pushRemoteButton.addEventListener('click', async () => {
    setStatus('Публікація в API...');
    try {
      persistRemoteConfig();
      const data = collectDataFromInputs();
      await writeRemote(data);
      setStatus('Тексти опубліковано в API.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Помилка публікації в API.', true);
    }
  });
};

initAdminPanel();

const hidePreloader = () => {
  if (!preloader) return;
  preloader.classList.add('is-hidden');
  document.body.classList.remove('is-preloading');
};

window.addEventListener('load', hidePreloader);
setTimeout(hidePreloader, 2200);

// Counter animation for advantage numbers
const animateCounter = (element, target, duration = 1200) => {
  let current = 0;
  const increment = target / (duration / 16);
  const interval = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    element.textContent = Math.floor(current) + '+';
  }, 16);
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const number = entry.target.querySelector('.advantage-number');
        if (number && !number.dataset.animated) {
          const value = parseInt(number.textContent);
          animateCounter(number, value, 1200);
          number.dataset.animated = 'true';
        }
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('.hero-mobile-advantages li').forEach((item) => {
  counterObserver.observe(item);
});

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
  menuToggle.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuToggle?.classList.remove('is-open');
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
    menuToggle.classList.remove('is-open');
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

const leadModal = document.getElementById('lead-modal');
const leadModalClose = document.getElementById('lead-modal-close');
const openLeadButtons = document.querySelectorAll('a.cta-btn:not(.cta-btn-outline), a.cta-link-btn');

const openLeadModal = () => {
  if (!leadModal) return;
  leadModal.classList.add('is-open');
  leadModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeLeadModal = () => {
  if (!leadModal) return;
  leadModal.classList.remove('is-open');
  leadModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

openLeadButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    openLeadModal();
  });
});

leadModalClose?.addEventListener('click', closeLeadModal);

leadModal?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.matches('[data-close-lead-modal]')) {
    closeLeadModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && leadModal?.classList.contains('is-open')) {
    closeLeadModal();
  }
});

const formSuccessByType = {
  'new-client': 'Дякуємо! Для вас зафіксовано знижку 15% як для нового клієнта.',
  pensioner: 'Заявка прийнята. Для пенсіонерів діє знижка 15%, скоро зателефонуємо.',
  military: 'Заявку для військових отримано. Пріоритетний дзвінок та знижка 15% активовано.',
};

const TELEGRAM_BOT_TOKEN = '8651844927:AAEmHoPrQoZSDOD_C5cyQ3wnelXnjxQ3Nb4';
const TELEGRAM_CHAT_ID = '-1003777987132';

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

  const send = async (chatId) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      const migratedChatId = result?.parameters?.migrate_to_chat_id;
      if (migratedChatId && String(chatId) !== String(migratedChatId)) {
        return send(String(migratedChatId));
      }
      throw new Error(result.description || 'Telegram send failed');
    }

    return result;
  };

  return send(TELEGRAM_CHAT_ID);
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

      if (form.id === 'lead-modal-form') {
        setTimeout(() => closeLeadModal(), 2600);
      }
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

// Carousel Gallery
const carouselImages = [
  { src: 'img/IMG_0690.PNG', alt: 'Сертифікат 1' },
  { src: 'img/IMG_0691.PNG', alt: 'Сертифікат 2' },
  { src: 'img/IMG_0692.PNG', alt: 'Сертифікат 3' },
  { src: 'img/IMG_0693.PNG', alt: 'Сертифікат 4' },
  { src: 'img/IMG_0694.PNG', alt: 'Сертифікат 5' },
  { src: 'img/IMG_0696.PNG', alt: 'Сертифікат 6' },
  { src: 'img/IMG_0697.JPG', alt: 'Сертифікат 7' },
  { src: 'img/IMG_0698.PNG', alt: 'Сертифікат 8' },
  { src: 'img/IMG_0699.PNG', alt: 'Сертифікат 9' },
  { src: 'img/IMG_0700.PNG', alt: 'Сертифікат 10' },
];

const carouselMainImage = document.getElementById('carousel-main-image');
const carouselPrevBtn = document.querySelector('.carousel-nav-prev');
const carouselNextBtn = document.querySelector('.carousel-nav-next');
const thumbItems = document.querySelectorAll('.thumb-item');
let currentCarouselIndex = 0;

const updateCarousel = (index) => {
  currentCarouselIndex = (index + carouselImages.length) % carouselImages.length;
  const image = carouselImages[currentCarouselIndex];
  
  if (carouselMainImage) {
    carouselMainImage.src = image.src;
    carouselMainImage.alt = image.alt;
  }
  
  // Update active thumbnail
  thumbItems.forEach((thumb, i) => {
    if (i === currentCarouselIndex) {
      thumb.classList.add('active');
      thumb.setAttribute('aria-current', 'true');
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      thumb.classList.remove('active');
      thumb.setAttribute('aria-current', 'false');
    }
  });
};

carouselPrevBtn?.addEventListener('click', () => {
  updateCarousel(currentCarouselIndex - 1);
});

carouselNextBtn?.addEventListener('click', () => {
  updateCarousel(currentCarouselIndex + 1);
});

// Thumbnail click handlers
thumbItems.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    const index = parseInt(thumb.dataset.index, 10);
    updateCarousel(index);
  });
});

// Keyboard navigation for carousel
document.addEventListener('keydown', (event) => {
  const carouselSection = document.getElementById('credentials');
  if (!carouselSection) return;
  
  // Only handle keyboard if carousel is in view or nearby
  const isCarouselVisible = carouselSection.getBoundingClientRect().top < window.innerHeight;
  if (!isCarouselVisible) return;
  
  if (event.key === 'ArrowLeft') {
    updateCarousel(currentCarouselIndex - 1);
  } else if (event.key === 'ArrowRight') {
    updateCarousel(currentCarouselIndex + 1);
  }
});

// Credential Lightbox
const carouselMainElement = document.getElementById('carousel-main');
const carouselFullscreenBtn = document.getElementById('carousel-fullscreen-btn');
const credentialLightbox = document.getElementById('credential-lightbox');
const credentialLightboxImage = document.getElementById('credential-lightbox-image');
const credentialLightboxClose = document.querySelector('.credential-lightbox-close');
const credentialNavNext = document.querySelector('.credential-nav-next');
const credentialNavPrev = document.querySelector('.credential-nav-prev');
let currentLightboxIndex = 0;

const openCredentialLightbox = (index) => {
  if (!credentialLightbox || index < 0 || index >= carouselImages.length) return;
  currentLightboxIndex = index;
  const image = carouselImages[index];
  
  if (credentialLightboxImage) {
    credentialLightboxImage.src = image.src;
    credentialLightboxImage.alt = image.alt;
  }
  
  credentialLightbox.classList.add('is-open');
  credentialLightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeCredentialLightbox = () => {
  if (!credentialLightbox) return;
  credentialLightbox.classList.remove('is-open');
  credentialLightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

const showNextCredentialImage = () => {
  const nextIndex = (currentLightboxIndex + 1) % carouselImages.length;
  openCredentialLightbox(nextIndex);
};

const showPrevCredentialImage = () => {
  const prevIndex = (currentLightboxIndex - 1 + carouselImages.length) % carouselImages.length;
  openCredentialLightbox(prevIndex);
};

// Open lightbox on button click or image click
carouselFullscreenBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  openCredentialLightbox(currentCarouselIndex);
});

carouselMainElement?.addEventListener('click', (e) => {
  if (e.target.matches('button')) return;
  openCredentialLightbox(currentCarouselIndex);
});

credentialLightboxClose?.addEventListener('click', closeCredentialLightbox);
credentialNavNext?.addEventListener('click', showNextCredentialImage);
credentialNavPrev?.addEventListener('click', showPrevCredentialImage);

credentialLightbox?.addEventListener('click', (event) => {
  if (event.target === credentialLightbox || event.target.classList.contains('credential-lightbox-backdrop')) {
    closeCredentialLightbox();
  }
});

document.addEventListener('keydown', (event) => {
  if (!credentialLightbox?.classList.contains('is-open')) return;
  
  if (event.key === 'Escape') {
    closeCredentialLightbox();
  } else if (event.key === 'ArrowRight') {
    showNextCredentialImage();
  } else if (event.key === 'ArrowLeft') {
    showPrevCredentialImage();
  }
});
