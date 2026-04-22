const API_BASE = 'http://localhost:3000';

function parseTokenPayload(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

function getRoleFromStorageOrToken() {
  const storedRole = localStorage.getItem('role');
  if (storedRole) return storedRole;
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = parseTokenPayload(token);
  return payload?.role || null;
}

function getDashboardRouteByRole(role) {
  return role === 'admin' ? 'admin.html' : 'dashboard.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const currentPage = (window.location.pathname.split('/').pop() || '').toLowerCase();
  const authPages = new Set(['', 'index.html', 'login.html', 'register.html']);
  const token = localStorage.getItem('token');
  if (token && authPages.has(currentPage)) {
    // Only redirect from auth pages to prevent refresh loops
    const role = getRoleFromStorageOrToken();
    const targetRoute = getDashboardRouteByRole(role);
    if (currentPage !== targetRoute.toLowerCase()) {
      window.location.href = targetRoute;
      return;
    }
  }

  // Login form
  const loginForm = document.getElementById('loginForm');
  const authNotice = document.getElementById('authNotice');
  const authNoticeText = document.getElementById('authNoticeText');
  const setAuthNotice = (message, tone = 'error') => {
    if (!authNotice || !authNoticeText) return;
    authNoticeText.textContent = message;
    authNotice.classList.remove('auth-notice--error', 'auth-notice--warning');
    authNotice.classList.add('show', tone === 'warning' ? 'auth-notice--warning' : 'auth-notice--error');
  };
  const clearAuthNotice = () => {
    if (!authNotice || !authNoticeText) return;
    authNoticeText.textContent = '';
    authNotice.classList.remove('show', 'auth-notice--error', 'auth-notice--warning');
  };
  if (loginForm) {
    clearAuthNotice();
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthNotice();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role || 'patient');
        // Redirect based on role
        window.location.href = getDashboardRouteByRole(data.role);
      } else {
        const message = data.message || 'Invalid email or password';
        const isDeactivated = /deactivat/i.test(message);
        setAuthNotice(message, isDeactivated ? 'warning' : 'error');
      }
    });
  }

  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const contactNumber = document.getElementById('contactNumber').value;
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, contactNumber }),
      });
      if (res.ok) {
        alert('Registered successfully');
        window.location.href = 'login.html';
      } else {
        alert('Registration failed');
      }
    });
  }

  // My Appointments page
  if (window.location.pathname.includes('my-appointments.html')) {
    loadAppointments();
    document.getElementById('bookAppointment').addEventListener('click', () => {
      const date = prompt('Enter date (YYYY-MM-DD)');
      const time = prompt('Enter time (HH:MM)');
      if (date && time) {
        bookAppointment(date, time);
      }
    });
  }

  // Admin
  if (window.location.pathname.includes('admin.html')) {
    loadAllAppointments();
  }
});

async function loadAppointments() {
  const res = await fetch(`${API_BASE}/appointments/my`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  const appointments = await res.json();
  const div = document.getElementById('appointments');
  div.innerHTML = appointments.map(a => `<p>${a.date} ${a.time} - ${a.status}</p>`).join('');
}

async function bookAppointment(date, time) {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ date, time }),
  });
  if (res.ok) {
    loadAppointments();
  }
}

async function loadAllAppointments() {
  const res = await fetch(`${API_BASE}/appointments`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  const appointments = await res.json();
  const div = document.getElementById('appointments');
  div.innerHTML = appointments.map(a => `
    <p>${a.date} ${a.time} - ${a.status} by ${a.patient.name}
    <button onclick="updateStatus(${a.id}, 'approved')">Approve</button>
    <button onclick="updateStatus(${a.id}, 'cancelled')">Cancel</button>
    </p>
  `).join('');
}

async function updateStatus(id, status) {
  await fetch(`${API_BASE}/appointments/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ status }),
  });
  loadAllAppointments();
}