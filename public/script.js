const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Redirect to dashboard after login
    window.location.href = 'dashboard.html';
  }

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
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
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      } else {
        alert('Login failed');
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