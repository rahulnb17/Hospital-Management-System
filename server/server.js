const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_new_password',
  database: 'hospital_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('MySQL connected as id ' + db.threadId);
});

// Real login endpoint
app.post('/login', (req, res) => {
  const { role, username, password } = req.body;

  // Validate input
  if (!['patient', 'doctor', 'staff'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  let table = '';
  switch (role) {
    case 'patient':
      table = 'patients';
      break;
    case 'doctor':
      table = 'doctors';
      break;
    case 'staff':
      table = 'staff';
      break;
  }

  const sql = `SELECT * FROM ${table} WHERE username = ? AND password = ?`;

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('DB Error during login:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = results[0];

    res.json({
      success: true,
      role,
      patient: role === 'patient' ? { id: user.id, name: user.name } : null,
      doctor: role === 'doctor' ? { id: user.id, name: user.name } : null,
      staff: role === 'staff' ? { id: user.id, name: user.name } : null,
      message: `Logged in successfully as ${role}`
    });
  });
});

// Add new doctor
app.post('/doctors', (req, res) => {
  const { name, specialization, username, password } = req.body;

  if (!name || !specialization || !username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = 'INSERT INTO doctors SET ?';
  const values = { name, specialization, username, password };

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ message: 'Failed to add doctor' });
    }
    res.json({ message: 'Doctor added successfully!' });
  });
});

// Add new staff member
app.post('/staff', (req, res) => {
  const { name, role, username, password } = req.body;

  if (!name || !role || !username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = 'INSERT INTO staff SET ?';
  const values = { name, role, username, password };

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ message: 'Failed to add staff' });
    }
    res.json({ message: 'Staff added successfully!' });
  });
});

// Register new patient
app.post('/patients', (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = 'INSERT INTO patients SET ?';
  const values = { name, username, password };

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ message: 'Failed to register patient' });
    }
    res.json({ message: 'Patient registered successfully!' });
  });
});

// Search doctors by specialization
app.get('/doctors/:spec', (req, res) => {
  const spec = req.params.spec;
  const sql = 'SELECT id, name, specialization FROM doctors WHERE specialization LIKE ?';
  db.query(sql, [`%${spec}%`], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB Error' });
    res.json(results);
  });
});

// Book an appointment
app.post('/appointments/book', (req, res) => {
  const { patient_id, doctor_id, appointment_time } = req.body;

  if (!patient_id || !doctor_id || !appointment_time) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = 'INSERT INTO appointments SET ?';
  const values = { patient_id, doctor_id, appointment_time };

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ message: 'Appointment booking failed' });
    }
    res.json({ message: 'Appointment booked successfully!' });
  });
});

// Get all appointments for a doctor
app.get('/doctors/:id/appointments', (req, res) => {
  const doctorId = req.params.id;

  const sql = `
    SELECT 
      a.id AS appointment_id,
      p.name AS patient_name,
      a.appointment_time,
      a.status
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.doctor_id = ?
  `;

  db.query(sql, [doctorId], (err, results) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ message: 'Failed to load appointments' });
    }

    res.json(results);
  });
});

// Update appointment status
app.put('/appointments/:id/status', (req, res) => {
  const apptId = req.params.id;
  const newStatus = req.body.status;
  const requestingDoctorId = req.body.doctor_id; // Get from frontend

  const validStatuses = ['pending', 'confirmed', 'completed'];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const sql = 'UPDATE appointments SET status = ? WHERE id = ?';
  const checkSql = 'SELECT doctor_id FROM appointments WHERE id = ?';

  db.query(checkSql, [apptId], (err, results) => {
    if (err) {
      console.error('DB Error checking ownership:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = results[0];

    if (appointment.doctor_id != requestingDoctorId) {
      return res.status(403).json({
        message: 'You are not authorized to update this appointment'
      });
    }
  

  const updateSql = 'UPDATE appointments SET status = ? WHERE id = ?';
    db.query(updateSql, [newStatus, apptId], (err, result) => {
      if (err) {
        console.error('DB Error:', err);
        return res.status(500).json({ message: 'Failed to update status' });
      }

    res.json({ message: `Appointment status changed to ${newStatus}` });
  });
});
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});