// Load logged-in patient info
window.onload = () => {
  const patientId = sessionStorage.getItem('patient_id');
  const patientName = sessionStorage.getItem('patient_name');

  if (!patientId) {
    alert("You must be logged in as a patient to book an appointment.");
    window.location.href = '../index.html';
    return;
  }

  const infoDisplay = document.getElementById('loggedInPatientInfo');
  if (infoDisplay) {
    infoDisplay.textContent = patientName ? `${patientName} (ID: ${patientId})` : `ID: ${patientId}`;
  }
};

// Search doctors by specialization
function searchDoctors() {
  const input = document.getElementById('specialization').value.trim();
  const select = document.getElementById('doctorList');
  const searchBtn = document.querySelector('button[onclick=\"searchDoctors()\"]');

  if (!input) {
    alert("Please enter a specialization.");
    return;
  }

  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
  }

  fetch(`http://localhost:3000/doctors/${encodeURIComponent(input)}`)
    .then(res => {
      if (!res.ok) throw new Error("Network error while fetching doctors");
      return res.json();
    })
    .then(doctors => {
      select.innerHTML = '<option value="">-- Select Doctor --</option>';

      if (doctors.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = "No doctors found";
        opt.disabled = true;
        select.appendChild(opt);
        return;
      }

      doctors.forEach(doctor => {
        const opt = document.createElement('option');
        opt.value = doctor.id;
        opt.textContent = `${doctor.name} (${doctor.specialization})`;
        select.appendChild(opt);
      });

    })
    .catch(err => {
      console.error("Error fetching doctors:", err);
      alert("Failed to load doctors.");
    })
    .finally(() => {
      if (searchBtn) {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search Doctors";
      }
    });
}

// Book selected appointment
function bookAppointment() {
  const patientId = sessionStorage.getItem('patient_id');
  const doctorId = document.getElementById('doctorList').value;
  const rawTime = document.getElementById('appointmentTime').value;

  const bookBtn = document.querySelector('button[onclick=\"bookAppointment()\"]');

  if (!patientId || !doctorId || !rawTime) {
    alert("Please log in and fill all fields.");
    return;
  }

  // Format date to MySQL DATETIME format 'YYYY-MM-DD HH:MM:SS'
  const formattedTime = new Date(rawTime).toISOString().slice(0, 19).replace("T", " ");

  const payload = {
    patient_id: parseInt(patientId),
    doctor_id: parseInt(doctorId),
    appointment_time: formattedTime
  };

  if (bookBtn) {
    bookBtn.disabled = true;
    bookBtn.textContent = "Booking...";
  }

  fetch('http://localhost:3000/appointments/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (!res.ok) throw new Error("Server responded with error");
    return res.json();
  })
  .then(data => {
    const list = document.getElementById('confirmation');
    const item = document.createElement('li');
    item.textContent = "✅ " + data.message;
    list.appendChild(item);

    // Clear form after success
    document.getElementById('doctorList').value = '';
    document.getElementById('appointmentTime').value = '';
  })
  .catch(err => {
    console.error("Booking error:", err);
    alert("Failed to book appointment. Please try again.");
  })
  .finally(() => {
    if (bookBtn) {
      bookBtn.disabled = false;
      bookBtn.textContent = "Book Appointment";
    }
  });
}