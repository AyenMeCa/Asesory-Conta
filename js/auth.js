// =============================================
// ASESORY CONTÁ — Autenticación simulada (localStorage)
// Mockup de demo: las contraseñas se guardan en texto plano a propósito.
// NO es seguridad real — solo aparenta un login/registro funcional.
// =============================================

// ── Credenciales demo hardcodeadas ──
const DEMO_USERS = [
  { name: 'María García', email: 'candidato@demo.com', password: 'Demo1234', role: 'candidato', initials: 'MG' },
  { name: 'Empresa ABC',  email: 'empresa@demo.com',   password: 'Demo1234', role: 'empresa',   initials: 'EA' },
  { name: 'Carlos Pérez', email: 'contador@demo.com',  password: 'Demo1234', role: 'contador',  initials: 'CP' },
];

const SESSION_KEY = 'asesory_user';
const REGISTERED_KEY = 'asesory_registered_users';

const ROLE_LABELS = { candidato: 'Candidato', empresa: 'Empresa', contador: 'Contador' };

// ── Helpers de almacenamiento ──
function getRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (e) {
    return null;
  }
}

// "María García" -> "MG" · "Empresa" -> "EM"
function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0].charAt(0);
  const second = parts.length > 1 ? parts[parts.length - 1].charAt(0) : (parts[0].charAt(1) || '');
  return (first + second).toUpperCase();
}

function emailExists(email) {
  const e = (email || '').trim().toLowerCase();
  return DEMO_USERS.concat(getRegisteredUsers()).some(function (u) {
    return u.email.toLowerCase() === e;
  });
}

// Valida credenciales contra DEMO_USERS + registrados. Devuelve userObj de sesión o null.
function authenticate(email, password) {
  const e = (email || '').trim().toLowerCase();
  const all = DEMO_USERS.concat(getRegisteredUsers());
  const found = all.find(function (u) {
    return u.email.toLowerCase() === e && u.password === password;
  });
  if (!found) return null;
  return { name: found.name, email: found.email, role: found.role, initials: found.initials };
}

// Guarda sesión y redirige al panel del usuario
function loginUser(userObj) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
  window.location.href = 'dashboard.html';
}

// Registra un usuario nuevo (lo acumula) y lo deja en sesión
function registerUser(userObj) {
  const registered = getRegisteredUsers();
  registered.push(userObj); // guarda también la contraseña para futuros logins
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(registered));
  const session = {
    name: userObj.name, email: userObj.email,
    role: userObj.role, initials: userObj.initials,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.location.href = 'dashboard.html';
}

// Cierra sesión y vuelve al inicio
function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'index.html';
}

// Escapa texto antes de inyectarlo como HTML
function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// ── Navbar dinámico según el estado de sesión ──
function updateNavbar() {
  const user = getCurrentUser();
  const navEnd = document.querySelector('.navbar-end');
  if (!navEnd || !user) return; // sin sesión: navbar queda como está

  const name = escapeHtml(user.name);
  const email = escapeHtml(user.email);
  const initials = escapeHtml(user.initials || getInitials(user.name));
  const roleText = escapeHtml(ROLE_LABELS[user.role] || '');

  navEnd.innerHTML =
    '<div class="dropdown dropdown-end">' +
      '<label tabindex="0" class="btn btn-ghost btn-sm normal-case gap-2 px-2 hover:bg-purple-50">' +
        '<span class="w-8 h-8 rounded-full bg-[#7C3AED] text-white text-xs font-bold flex items-center justify-center shrink-0">' + initials + '</span>' +
        '<span class="hidden sm:block text-sm font-semibold text-gray-900 max-w-[140px] truncate">' + name + '</span>' +
        '<i class="ti ti-chevron-down text-gray-500 text-sm" aria-hidden="true"></i>' +
      '</label>' +
      '<ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[100] p-2 shadow-lg bg-white rounded-xl border border-gray-100 w-60">' +
        '<li class="px-3 pt-1 pb-2 pointer-events-none">' +
          '<div class="block hover:bg-transparent">' +
            '<span class="block text-xs text-gray-400">Sesión iniciada como</span>' +
            '<span class="block text-sm font-medium text-gray-900 break-all">' + email + '</span>' +
            '<span class="block text-xs font-semibold text-[#7C3AED]">' + roleText + '</span>' +
          '</div>' +
        '</li>' +
        '<div class="divider my-0"></div>' +
        '<li><a href="dashboard.html" class="font-medium text-gray-700"><i class="ti ti-layout-dashboard" aria-hidden="true"></i> Mi panel</a></li>' +
        '<li><a id="logout-link" class="text-[#DC2626] font-medium"><i class="ti ti-logout" aria-hidden="true"></i> Cerrar sesión</a></li>' +
      '</ul>' +
    '</div>';

  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
      e.preventDefault();
      logoutUser();
    });
  }
}

// ── Mostrar/ocultar contraseña (cualquier página) ──
function initPasswordToggles() {
  document.querySelectorAll('[data-password-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const input = document.getElementById(btn.getAttribute('data-password-toggle'));
      if (!input) return;
      const icon = btn.querySelector('i');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      if (icon) {
        icon.classList.toggle('ti-eye', !show);
        icon.classList.toggle('ti-eye-off', show);
      }
      btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
  });
}

// ── Helpers de mensajes ──
function showBox(box, message) {
  if (!box) return;
  box.textContent = message;
  box.classList.remove('hidden');
}
function setFieldError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}
function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach(function (el) {
    el.textContent = '';
    el.classList.add('hidden');
  });
}

// ── Formulario de login ──
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  const errorBox = document.getElementById('login-error');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (errorBox) errorBox.classList.add('hidden');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const user = authenticate(email, password);
    if (user) {
      loginUser(user);
    } else {
      showBox(errorBox, 'Correo o contraseña incorrectos. Verifica tus datos.');
    }
  });

  // Autorrelleno de la cuenta de candidato (mejora la demo)
  const fillBtn = document.getElementById('fill-demo');
  if (fillBtn) {
    fillBtn.addEventListener('click', function () {
      const emailInput = document.getElementById('email');
      const passInput = document.getElementById('password');
      if (emailInput) emailInput.value = 'candidato@demo.com';
      if (passInput) passInput.value = 'Demo1234';
      if (errorBox) errorBox.classList.add('hidden');
    });
  }
}

// ── Formulario de registro ──
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  // Selector de rol
  let selectedRole = 'candidato';
  const roleTabs = document.querySelectorAll('.role-tab');
  function setRole(role) {
    selectedRole = role;
    roleTabs.forEach(function (t) {
      const active = t.getAttribute('data-role') === role;
      t.classList.toggle('active', active);
      t.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  roleTabs.forEach(function (t) {
    t.addEventListener('click', function () { setRole(t.getAttribute('data-role')); });
  });

  // Preselección por query param (?tipo=contador / empresa / candidato)
  const tipo = new URLSearchParams(window.location.search).get('tipo');
  setRole(['candidato', 'empresa', 'contador'].indexOf(tipo) !== -1 ? tipo : 'candidato');

  const msgBox = document.getElementById('register-msg');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearFieldErrors();
    if (msgBox) { msgBox.className = 'hidden'; msgBox.textContent = ''; }

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const terms = document.getElementById('reg-terms').checked;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let valid = true;
    if (name.length < 3) {
      setFieldError('err-name', 'Ingresa tu nombre completo (mínimo 3 caracteres).');
      valid = false;
    }
    if (!emailRe.test(email)) {
      setFieldError('err-email', 'Ingresa un correo electrónico válido.');
      valid = false;
    } else if (emailExists(email)) {
      setFieldError('err-email', 'Este correo ya está registrado. Intenta iniciar sesión.');
      valid = false;
    }
    if (password.length < 8) {
      setFieldError('err-password', 'La contraseña debe tener mínimo 8 caracteres.');
      valid = false;
    }
    if (confirm !== password) {
      setFieldError('err-confirm', 'Las contraseñas no coinciden.');
      valid = false;
    }
    if (!terms) {
      setFieldError('err-terms', 'Debes aceptar los términos y condiciones para continuar.');
      valid = false;
    }

    if (!valid) return;

    const userObj = {
      name: name,
      email: email,
      password: password,
      role: selectedRole,
      initials: getInitials(name),
    };

    // Mensaje de éxito breve antes de redirigir
    if (msgBox) {
      msgBox.textContent = '¡Cuenta creada con éxito! Redirigiendo...';
      msgBox.className = 'rounded-lg p-3 text-sm bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669]';
    }
    setTimeout(function () { registerUser(userObj); }, 800);
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', function () {
  updateNavbar();
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
});
