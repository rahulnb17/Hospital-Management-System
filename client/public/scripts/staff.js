function addStaff() {
  const name = document.getElementById('staffName').value.trim();
  const role = document.getElementById('staffRole').value.trim();
  const username = document.getElementById('staffUsername').value.trim();
  const password = document.getElementById('staffPassword').value;

  if (!name || !role || !username || !password) {
    alert("Please fill all fields.");
    return;
  }

  const payload = { name, role, username, password };

  fetch('http://localhost:3000/staff', {
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
  })
  .catch(err => {
    console.error("Error adding staff:", err);
    alert("Failed to add staff.");
  });
}