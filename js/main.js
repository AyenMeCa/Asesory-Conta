// =============================================
// ASESORY CONTÁ — JavaScript global compartido
// =============================================

document.addEventListener('DOMContentLoaded', function () {

  // ── Navbar mobile: cerrar menú al hacer clic fuera ──
  document.addEventListener('click', function (e) {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(function (dropdown) {
      if (!dropdown.contains(e.target)) {
        const details = dropdown.querySelector('ul');
        if (details) details.blur();
      }
    });
  });

  // ── Navbar: marcar link activo según URL actual ──
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-page-link');
  navLinks.forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('nav-active');
    }
  });

  // ── Scroll reveal: cada <section> aparece al entrar al viewport ──
  // Se desactiva con prefers-reduced-motion. La clase .reveal solo se
  // aplica vía JS, así el contenido nunca queda oculto si no hay soporte.
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('main section').forEach(function (s) {
      s.classList.add('reveal');
      obs.observe(s);
    });
  }

  // ── Pills de categoría (página Buscar empleo): selección única ──
  // Solo cambia el estado visual; NO filtra resultados.
  const catPills = document.querySelectorAll('.cat-pill');
  catPills.forEach(function (pill) {
    pill.addEventListener('click', function (e) {
      e.preventDefault();
      catPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
    });
  });

  // ── Formulario de contacto (página Contacto): envío simulado ──
  // Valida, guarda el mensaje en localStorage y muestra confirmación.
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const contactMsg = document.getElementById('contact-msg');

    const showFieldError = function (id, message) {
      const el = document.getElementById(id);
      if (el) { el.textContent = message; el.classList.remove('hidden'); }
    };
    const clearContactErrors = function () {
      contactForm.querySelectorAll('.field-error').forEach(function (el) {
        el.textContent = '';
        el.classList.add('hidden');
      });
    };

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearContactErrors();
      if (contactMsg) { contactMsg.className = 'hidden'; contactMsg.textContent = ''; }

      const name = document.getElementById('c-name').value.trim();
      const email = document.getElementById('c-email').value.trim();
      const subject = document.getElementById('c-subject').value;
      const message = document.getElementById('c-message').value.trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      let valid = true;
      if (name.length < 3) { showFieldError('err-c-name', 'Ingresa tu nombre completo (mínimo 3 caracteres).'); valid = false; }
      if (!emailRe.test(email)) { showFieldError('err-c-email', 'Ingresa un correo electrónico válido.'); valid = false; }
      if (!subject) { showFieldError('err-c-subject', 'Selecciona un asunto.'); valid = false; }
      if (message.length < 10) { showFieldError('err-c-message', 'Tu mensaje debe tener al menos 10 caracteres.'); valid = false; }

      if (!valid) return;

      // Guardado simulado en localStorage
      const entry = { name: name, email: email, subject: subject, message: message };
      try { entry.date = new Date().toISOString(); } catch (err) { /* sin fecha */ }
      let stored = [];
      try { stored = JSON.parse(localStorage.getItem('asesory_contact_messages')) || []; } catch (err) { stored = []; }
      stored.push(entry);
      localStorage.setItem('asesory_contact_messages', JSON.stringify(stored));

      contactForm.reset();
      if (contactMsg) {
        contactMsg.textContent = '¡Mensaje enviado con éxito! Te responderemos pronto.';
        contactMsg.className = 'rounded-lg p-3 text-sm bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669]';
      }
    });
  }

});
