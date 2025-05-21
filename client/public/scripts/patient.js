function addPatient() {
  const name = document.getElementById('patientName').value.trim();
  const username = document.getElementById('patientUsername').value.trim();
  const password = document.getElementById('patientPassword').value.trim();

  if (!name || !username || !password) {
    alert("Please fill all fields.");
    return;
  }

  const payload = { name, username, password };

  fetch('http://localhost:3000/patients', {
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
    document.getElementById('patientName').value = '';
    document.getElementById('patientUsername').value = '';
    document.getElementById('patientPassword').value = '';
  })
  .catch(err => {
    console.error("Error registering patient:", err);
    alert("Failed to register patient.");
  });
}