// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './index.css';

// Import API services
import { patientsApi, analyticsApi, appointmentsApi, doctorsApi, authApi } from './services/api';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';
import {Dashboard} from './pages/Dashboard';
import {Patients} from './pages/Patients';
import AppointmentsSection from './pages/AppointmentsSection';
import DoctorsSection from './pages/DoctorsSection';
import {Login} from './pages/Login';

// Import types
import { Patient, Appointment, Doctor, DashboardStats } from './services/types';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    patientStats: {
      total: 0,
      new: 0,
      active: 0,
      discharged: 0
    },
    appointmentStats: {
      today: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0
    },
    resourceStats: {
      occupancyRate: 0,
      availableBeds: 0,
      totalStaff: 0,
      activeShifts: 0
    },
    revenueStats: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearToDate: 0
    },
    performanceMetrics: {
      averageWaitTime: 0,
      patientSatisfaction: 0,
      treatmentSuccess: 0,
      readmissionRate: 0
    }
  });
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.getCurrentUser(token)
        .then(() => {
          setIsAuthenticated(true);
          fetchData();
        })
        .catch(() => {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data in parallel
      const [patientsData, dashboardData] = await Promise.all([
        patientsApi.getPatients(),
        analyticsApi.getDashboardMetrics()
      ]);

      // Use sample data for appointments and doctors temporarily
      const appointmentsData: Appointment[] = [
        { 
          id: 'A001', 
          patientId: 'P001',
          patientName: 'John Smith', 
          doctorId: 'D001',
          doctorName: 'Dr. Emily Rodriguez', 
          department: 'Cardiology', 
          date: '2024-01-16', 
          time: '10:00 AM', 
          status: 'scheduled',
          notes: 'Routine checkup'
        },
        { 
          id: 'A002', 
          patientId: 'P002',
          patientName: 'Sarah Johnson', 
          doctorId: 'D002',
          doctorName: 'Dr. David Kim', 
          department: 'Internal Medicine', 
          date: '2024-01-15', 
          time: '11:30 AM', 
          status: 'completed',
          notes: 'Follow-up appointment'
        }
      ];

      const doctorsData: Doctor[] = [
        { 
          id: 'D001', 
          name: 'Dr. Emily Rodriguez', 
          specialty: 'Cardiology', 
          experience: '15 years', 
          email: 'emily.rodriguez@mediflow.com', 
          phone: '(555) 100-2001', 
          schedule: 'Mon-Fri, 8:00 AM - 5:00 PM', 
          isActive: true 
        },
        { 
          id: 'D002', 
          name: 'Dr. David Kim', 
          specialty: 'Internal Medicine', 
          experience: '12 years', 
          email: 'david.kim@mediflow.com', 
          phone: '(555) 100-2002', 
          schedule: 'Mon-Fri, 9:00 AM - 6:00 PM', 
          isActive: true 
        }
      ];

      setPatients(patientsData);
      setStats(dashboardData);
      setAppointments(appointmentsData);
      setDoctors(doctorsData);
    } catch (err) {
      setError('Failed to fetch data. Please check if the backend is running.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (patientData: any) => {
    try {
      const newPatient = await patientsApi.createPatient(patientData);
      setPatients([...patients, newPatient]);
      setStats(prev => ({
        ...prev,
        patientStats: {
          ...prev.patientStats,
          total: prev.patientStats.total + 1,
          new: prev.patientStats.new + 1
        }
      }));
      return { success: true };
    } catch (err: any) {
      console.error('Error adding patient:', err);
      return { success: false, error: err.message };
    }
  };

  const handleAddAppointment = async (appointmentData: any) => {
    try {
      const newAppointment = await appointmentsApi.createAppointment(appointmentData);
      setAppointments([...appointments, newAppointment]);
      setStats(prev => ({
        ...prev,
        appointmentStats: {
          ...prev.appointmentStats,
          today: prev.appointmentStats.today + 1,
          upcoming: prev.appointmentStats.upcoming + 1
        }
      }));
      return { success: true };
    } catch (err: any) {
      console.error('Error adding appointment:', err);
      return { success: false, error: err.message };
    }
  };

  const handleAddDoctor = async (doctorData: any) => {
    try {
      const newDoctor = await doctorsApi.createDoctor(doctorData);
      setDoctors([...doctors, newDoctor]);
      setStats(prev => ({
        ...prev,
        resourceStats: {
          ...prev.resourceStats,
          totalStaff: prev.resourceStats.totalStaff + 1
        }
      }));
      return { success: true };
    } catch (err: any) {
      console.error('Error adding doctor:', err);
      return { success: false, error: err.message };
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setActiveSection('dashboard');
  };

  const renderSection = () => {
    if (loading) {
      return (
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchData} className="btn btn-primary">
            Retry
          </button>
        </div>
      );
    }

    
  switch (activeSection) {
      case 'dashboard':
        return <Dashboard stats={stats} appointments={appointments} />;
      case 'patients':
        return <Patients patients={patients} onAddPatient={handleAddPatient} onRefresh={fetchData} />;
      case 'appointments':
  return <AppointmentsSection appointments={appointments} onAddAppointment={handleAddAppointment} onRefresh={fetchData} />;
      case 'doctors':
        return <DoctorsSection doctors={doctors} onAddDoctor={handleAddDoctor} onRefresh={fetchData}/>;
      default:
        return <Dashboard stats={stats} appointments={appointments} />;
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
      }}
    >
      <div className="app">
        <Header activeSection={activeSection} setActiveSection={setActiveSection} onLogout={handleLogout} />
        <main className="main">
          <div className="container">
            {renderSection()}
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;