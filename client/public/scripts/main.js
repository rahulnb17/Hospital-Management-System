// Function called when user clicks login button
function loginAs(role) {
  // Make sure role is valid
  if (!['patient', 'doctor', 'staff'].includes(role)) {
    alert("Invalid role selected.");
    return;
  }

  const username = prompt("Enter username:");
  const password = prompt("Enter password:");

  if (!username || !password) {
    alert("Username and password are required.");
    return;
  }

  const loginBtn = document.activeElement;
  const originalText = loginBtn.innerText;

  loginBtn.disabled = true;
  loginBtn.innerText = 'Logging in...';

  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role, username, password })
  })
  .then(response => {
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  })
  .then(data => {
    if (data.success) {
      sessionStorage.setItem('userRole', role);

      // Handle patient login
      if (role === 'patient' && data.patient) {
        sessionStorage.setItem('patient_id', data.patient.id);
        sessionStorage.setItem('patient_name', data.patient.name);

        const loggedInActions = document.getElementById('loggedInActions');
        if (loggedInActions) {
          loggedInActions.style.display = 'block';
        }

        window.location.href = 'appointment.html';
        return;
      }

      // Handle doctor login
      if (role === 'doctor' && data.doctor) {
        sessionStorage.setItem('userRole', 'doctor');
        sessionStorage.setItem('doctor_id', data.doctor.id);
        sessionStorage.setItem('doctor_name', data.doctor.name);

        const loggedInActions = document.getElementById('loggedInActions');
        const doctorBtn = document.getElementById('doctorDashboardBtn');

        if (loggedInActions) {
          loggedInActions.style.display = 'block';
        }
        if (doctorBtn) {
          doctorBtn.style.display = 'block';
        }

        window.location.href = 'doctor-dashboard.html';
        return;
      }

      // Handle staff login
      if (role === 'staff' && data.staff) {
        sessionStorage.setItem('staff_id', data.staff.id);
        sessionStorage.setItem('staff_name', data.staff.name);

        const loggedInActions = document.getElementById('loggedInActions');
        if (loggedInActions) {
          loggedInActions.style.display = 'block';
        }

        window.location.href = 'staff-dashboard.html';
        return;
      }

      // Fallback: redirect by role only
      switch (role) {
        case 'patient':
          window.location.href = 'appointment.html';
          break;
        case 'doctor':
          window.location.href = 'doctor-dashboard.html';
          break;
        case 'staff':
          window.location.href = 'staff-dashboard.html';
          break;
        default:
          alert('Unknown role');
      }
    } else {
      alert('Login failed: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred during login.');
  })
  .finally(() => {
    loginBtn.disabled = false;
    loginBtn.innerText = originalText;
  });
}

// Helper to redirect pages
function goTo(page) {
  window.location.href = page;
}