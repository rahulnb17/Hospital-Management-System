hospital-management-system/
│
├── client/                      # Frontend (HTML + CSS + JS)
│   ├── index.html               # Login Page
│   ├── appointment.html         # Book Appointment Page
│   ├── patient-dashboard.html   # Register Patient
│   ├── doctor-dashboard.html    # Add Doctor
│   ├── staff-dashboard.html     # Add Staff
│   ├── style.css                # Shared Styles
│
│   └── public/
│       └── scripts/
│           ├── main.js          # Role-based login logic
│           ├── appointment.js   # Book appointment logic
│           ├── register-patient.js  # Add new patient logic
│           ├── doctor.js        # Add new doctor logic
│           └── staff.js         # Add new staff logic
│
├── server/                      # Backend – Node.js + Express
│   ├── server.js                # Main backend file
│
├── database/                    # MySQL Setup
│   └── init.sql                 # Table creation + sample data (optional)
│
├── package.json
└── README.md