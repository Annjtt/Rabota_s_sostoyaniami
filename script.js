document.addEventListener('DOMContentLoaded', () => {
  // 📦 1. Плавный скролл по якорным ссылкам
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 🎬 2. Анимация появления блоков при скролле
  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        animateObserver.unobserve(entry.target); // Анимация срабатывает только один раз
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px' // Срабатывает чуть раньше полного появления
  });

  document.querySelectorAll('[data-animate]').forEach(section => {
    animateObserver.observe(section);
  });

  // 📝 3. Обработка формы
  const form = document.getElementById('leadForm');
  const statusEl = document.getElementById('formStatus');
  const submitBtn = form.querySelector('.form-btn');

  // Утилита: показать ошибку поля
  const showFieldError = (input, message) => {
    let errorEl = input.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains('field-error')) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      errorEl.style.color = '#D32F2F';
      errorEl.style.fontSize = '0.8rem';
      errorEl.style.marginTop = '4px';
      errorEl.style.display = 'block';
      input.parentNode.insertBefore(errorEl, input.nextSibling);
    }
    errorEl.textContent = message;
    input.classList.add('error');
  };

  // Утилита: очистить ошибки
  const clearErrors = () => {
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    statusEl.textContent = '';
    statusEl.className = 'form-status';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const name = form.querySelector('#name').value.trim();
    const contact = form.querySelector('#contact-input').value.trim();
    const comment = form.querySelector('#comment').value.trim();
    const privacy = form.querySelector('#privacy').checked;

    let isValid = true;
    if (!name) { showFieldError(form.querySelector('#name'), 'Введите ваше имя'); isValid = false; }
    if (!contact) { showFieldError(form.querySelector('#contact-input'), 'Укажите Telegram или телефон'); isValid = false; }
    if (!privacy) { showFieldError(form.querySelector('#privacy'), 'Необходимо согласие'); isValid = false; }

    if (!isValid) return;

    // 🔄 Состояние загрузки
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    statusEl.textContent = '';

    try {
      // ⚠️ Замените URL на ваш реальный endpoint (Vercel/Netlify/PHP/Node)
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, comment })
      });

      if (response.ok) {
        statusEl.textContent = '✅ Заявка успешно отправлена! Валерия свяжется с вами в течение 24 часов.';
        statusEl.classList.add('success');
        form.reset();
      } else {
        throw new Error('Ошибка сервера');
      }
    } catch (error) {
      statusEl.textContent = '❌ Произошла ошибка. Попробуйте позже или напишите напрямую в Telegram.';
      statusEl.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить заявку';
      // Прокрутка к статусу для мобильных
      statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // 🧹 Очистка ошибки поля при вводе
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errorEl = input.nextElementSibling;
      if (errorEl && errorEl.classList.contains('field-error')) errorEl.remove();
    });
  });
});