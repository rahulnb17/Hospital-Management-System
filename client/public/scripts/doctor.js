// Run when page loads
window.onload = () => {
  const doctorId = sessionStorage.getItem('doctor_id');
  const doctorName = sessionStorage.getItem('doctor_name');

  document.getElementById('loggedInDoctorInfo').textContent =
    doctorName ? `${doctorName} (ID: ${doctorId})` : `ID: ${doctorId}`;

  if (doctorId) {
    loadAppointments(doctorId);
  } else {
    document.getElementById('appointmentsList').innerHTML =
      '<p>You must be logged in to view appointments.</p>';
  }
};

// Load all appointments for this doctor
function loadAppointments(doctor_id) {
  fetch(`http://localhost:3000/doctors/${doctor_id}/appointments`)
    .then(res => res.json())
    .then(appointments => {
      const container = document.getElementById('appointmentsList');
      container.innerHTML = ''; // Clear loading message

      if (!appointments.length) {
        container.innerHTML = '<p>No appointments found.</p>';
        return;
      }

      const table = document.createElement('table');
      table.style.width = '100%';
      table.innerHTML = `
        <tr>
          <th>Appointment ID</th>
          <th>Patient</th>
          <th>Date & Time</th>
          <th>Status</th>
        </tr>
      `;

      appointments.forEach(appt => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${appt.id}</td>
          <td>${appt.patient_name}</td>
          <td>${new Date(appt.appointment_time).toLocaleString()}</td>
          <td>${appt.status}</td>
        `;
        table.appendChild(row);
      });

      container.appendChild(table);
    })
    .catch(err => {
      console.error("Error fetching appointments:", err);
      alert("Failed to load appointments.");
    });
}

// Send updated status to server
function updateAppointmentStatus() {
  const apptId = document.getElementById('appointmentId').value.trim();
  const newStatus = document.getElementById('statusSelect').value;

  if (!apptId || !newStatus) {
    alert("Please enter an Appointment ID and select a status.");
    return;
  }

  fetch(`http://localhost:3000/appointments/${apptId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus, doctor_id: doctorId })
  })
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('statusMessages');
    const item = document.createElement('li');
    item.textContent = "✅ " + data.message;
    list.appendChild(item);

    // Reload appointments after update
    const doctorId = sessionStorage.getItem('doctor_id');
    if (doctorId) loadAppointments(doctorId);
  })
  .catch(err => {
    console.error("Error updating status:", err);
    alert("Failed to update appointment status.");
  });
}

// Existing: Add Doctor Functionality
function addDoctor() {
  const name = document.getElementById('doctorName').value.trim();
  const specialization = document.getElementById('doctorSpecialization').value.trim();
  const username = document.getElementById('doctorUsername').value.trim();
  const password = document.getElementById('doctorPassword').value;

  if (!name || !specialization || !username || !password) {
    alert("Please fill all fields.");
    return;
  }

  const payload = { name, specialization, username, password };

  fetch('http://localhost:3000/doctors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('confirmation');
    const item = document.createElement('li');
    item.textContent = "✅ " + data.message;
    list.appendChild(item);

    // Clear form after success
    document.getElementById('doctorName').value = '';
    document.getElementById('doctorSpecialization').value = '';
    document.getElementById('doctorUsername').value = '';
    document.getElementById('doctorPassword').value = '';
  })
  .catch(err => {
    console.error("Error adding doctor:", err);
    alert("Failed to add doctor.");
  });
}