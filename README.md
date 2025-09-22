# Medical Platform

A simple, easy-to-run medical platform for patient management, appointment scheduling, and medical records.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Access the platform:**
   - Open your browser and go to: `http://localhost:3000`
   - The backend API runs on: `http://localhost:5000`

## 📊 Features

### Dashboard
- **Overview Metrics**: Total patients, doctors, appointments
- **Recent Appointments**: Latest appointment activity
- **Quick Actions**: Add patients and schedule appointments

### Patient Management
- **Patient Records**: Complete patient information
- **Medical History**: Track conditions, allergies, medications
- **Insurance Information**: Provider and policy details
- **Contact Information**: Phone, email, emergency contacts

### Appointment Scheduling
- **Schedule Appointments**: Book patient appointments
- **Doctor Assignment**: Assign doctors to appointments
- **Appointment Types**: Consultation, follow-up, physical, emergency
- **Status Tracking**: Scheduled, completed, cancelled

### Medical Staff
- **Doctor Profiles**: Name, specialty, contact information
- **Schedule Information**: Availability and working hours
- **Specialty Areas**: Internal Medicine, Cardiology, Pediatrics

## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface
- **Bootstrap** - Styling and responsive design
- **React-Bootstrap** - UI components

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **JSON Data** - Simple data storage (no database required)

## 📁 Project Structure

```
medical-platform/
├── server.js              # Backend server
├── package.json           # Root dependencies
├── client/                # React frontend
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── index.js      # React entry point
│   │   └── index.css     # Custom styles
│   ├── public/
│   │   └── index.html    # HTML template
│   └── package.json      # Frontend dependencies
└── README.md             # This file
```

## 🔧 API Endpoints

- `GET /api/health` - Server health check
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get specific patient
- `POST /api/patients` - Add new patient
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Schedule new appointment
- `GET /api/doctors` - Get all doctors
- `GET /api/medical-records` - Get medical records
- `GET /api/dashboard` - Get dashboard data

## 📈 Sample Data

The platform includes realistic sample data:
- **3 patients** with complete medical information
- **3 doctors** with different specialties
- **4 appointments** with various statuses
- **2 medical records** with diagnosis and treatment info

## 🎯 Key Features

### Patient Information
- Personal details (name, age, gender, contact)
- Medical history and current conditions
- Allergies and current medications
- Insurance information
- Emergency contact details

### Appointment Management
- Schedule new appointments
- Assign doctors to patients
- Track appointment status
- Add appointment notes
- View appointment history

### Medical Records
- Diagnosis and treatment information
- Vital signs tracking
- Doctor notes and recommendations
- Treatment history

## 🚀 Deployment

For production deployment:

1. **Build the React app:**
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change the PORT in server.js
   - Or kill the process using the port

2. **Dependencies not installed:**
   - Run `npm install` in both root and client directories

3. **API not responding:**
   - Check if server.js is running
   - Verify the API endpoints in browser

## 📱 Responsive Design

The platform is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎨 Customization

### Adding New Data
Edit the `medicalData` object in `server.js` to add:
- New patients
- Additional doctors
- More appointments
- Medical records

### Styling
- Modify Bootstrap classes in `App.js`
- Add custom CSS in `client/src/index.css`
- Use React-Bootstrap components for UI elements

## 🔒 Security

This is a demo application. For production use, consider adding:
- User authentication
- Input validation
- Data encryption
- HIPAA compliance measures

---

**Built with ❤️ for healthcare professionals**

*Simple, clean, and easy to run - perfect for medical practice management!*