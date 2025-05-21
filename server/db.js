const mysql = require('mysql2');

// Create a connection to the database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // Adjust based on your MySQL setup
  password: 'your_new_password',        // Change if needed
  database: 'hospital_db'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('MySQL connected as id ' + db.threadId);
});

module.exports = db;