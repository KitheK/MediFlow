import axios from 'axios';

// api.ts
const API_BASE_URL='http://127.0.0.1:8000';
const API_TIMEOUT = 5000;
// Use them in your axios config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Add to your existing api.ts file in the appropriate sections

// Appointments API
export const appointmentsApi = {
  getAppointments: async (params?: { 
    skip?: number; 
    limit?: number; 
    date?: string;
    status?: string;
    doctor_id?: string;
  }) => {
    const response = await api.get('/api/appointments', { params });
    return response.data;
  },

  getAppointment: async (appointmentId: string) => {
    const response = await api.get(`/api/appointments/${appointmentId}`);
    return response.data;
  },

  createAppointment: async (appointmentData: any) => {
    const response = await api.post('/api/appointments', appointmentData);
    return response.data;
  },

  updateAppointment: async (appointmentId: string, appointmentData: any) => {
    const response = await api.put(`/api/appointments/${appointmentId}`, appointmentData);
    return response.data;
  },

  deleteAppointment: async (appointmentId: string) => {
    await api.delete(`/api/appointments/${appointmentId}`);
  },

  rescheduleAppointment: async (appointmentId: string, newDateTime: string) => {
    const response = await api.patch(`/api/appointments/${appointmentId}/reschedule`, {
      new_date_time: newDateTime
    });
    return response.data;
  },

  updateAppointmentStatus: async (appointmentId: string, status: string) => {
    const response = await api.patch(`/api/appointments/${appointmentId}/status`, {
      status
    });
    return response.data;
  }
};

// Doctors API
export const doctorsApi = {
  getDoctors: async (params?: { 
    skip?: number; 
    limit?: number; 
    department_id?: string;
    specialty?: string;
    is_active?: boolean;
  }) => {
    const response = await api.get('/api/doctors', { params });
    return response.data;
  },

  getDoctor: async (doctorId: string) => {
    const response = await api.get(`/api/doctors/${doctorId}`);
    return response.data;
  },

  createDoctor: async (doctorData: any) => {
    const response = await api.post('/api/doctors', doctorData);
    return response.data;
  },

  updateDoctor: async (doctorId: string, doctorData: any) => {
    const response = await api.put(`/api/doctors/${doctorId}`, doctorData);
    return response.data;
  },

  deleteDoctor: async (doctorId: string) => {
    await api.delete(`/api/doctors/${doctorId}`);
  },

  getDoctorSchedule: async (doctorId: string) => {
    const response = await api.get(`/api/doctors/${doctorId}/schedule`);
    return response.data;
  },

  updateDoctorSchedule: async (doctorId: string, scheduleData: any) => {
    const response = await api.put(`/api/doctors/${doctorId}/schedule`, scheduleData);
    return response.data;
  },

  getDoctorAvailability: async (doctorId: string, date: string) => {
    const response = await api.get(`/api/doctors/${doctorId}/availability`, {
      params: { date }
    });
    return response.data;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getCurrentUser: async (token: string) => {
    const response = await api.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

// Patients API
export const patientsApi = {
  getPatients: async (params?: { skip?: number; limit?: number; search?: string }) => {
    const response = await api.get('/api/patients', { params });
    return response.data;
  },

  getPatient: async (patientId: string) => {
    const response = await api.get(`/api/patients/${patientId}`);
    return response.data;
  },

  createPatient: async (patientData: any) => {
    const response = await api.post('/api/patients', patientData);
    return response.data;
  },

  updatePatient: async (patientId: string, patientData: any) => {
    const response = await api.put(`/api/patients/${patientId}`, patientData);
    return response.data;
  },

  deletePatient: async (patientId: string) => {
    await api.delete(`/api/patients/${patientId}`);
  },

  getPatientAdmissions: async (patientId: string) => {
    const response = await api.get(`/api/patients/${patientId}/admissions`);
    return response.data;
  },

  createAdmission: async (patientId: string, admissionData: any) => {
    const response = await api.post(`/api/patients/${patientId}/admissions`, admissionData);
    return response.data;
  },

  createDischarge: async (admissionId: string, dischargeData: any) => {
    const response = await api.post(`/api/patients/admissions/${admissionId}/discharge`, dischargeData);
    return response.data;
  },

  getPatientOutcomes: async (patientId: string) => {
    const response = await api.get(`/api/patients/${patientId}/outcomes`);
    return response.data;
  },

  createPatientOutcome: async (patientId: string, outcomeData: any) => {
    const response = await api.post(`/api/patients/${patientId}/outcomes`, outcomeData);
    return response.data;
  },

  createReadmission: async (patientId: string, readmissionData: any) => {
    const response = await api.post(`/api/patients/${patientId}/readmissions`, readmissionData);
    return response.data;
  },

  createSatisfactionScore: async (patientId: string, satisfactionData: any) => {
    const response = await api.post(`/api/patients/${patientId}/satisfaction`, satisfactionData);
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getDashboardMetrics: async () => {
    const response = await api.get('/api/analytics/dashboard');
    return response.data;
  },

  getOccupancyTrends: async (days: number = 30) => {
    const response = await api.get('/api/analytics/trends/occupancy', { params: { days } });
    return response.data;
  },

  getReadmissionTrends: async (days: number = 30) => {
    const response = await api.get('/api/analytics/trends/readmissions', { params: { days } });
    return response.data;
  },

  getDepartmentPerformance: async () => {
    const response = await api.get('/api/analytics/departments/performance');
    return response.data;
  },

  getPatientOutcomeSummary: async () => {
    const response = await api.get('/api/analytics/patient-outcomes');
    return response.data;
  },

  getResourceUtilization: async () => {
    const response = await api.get('/api/analytics/resource-utilization');
    return response.data;
  },

  getCostAnalysis: async (startDate: string, endDate: string, departmentId?: string) => {
    const params: any = { start_date: startDate, end_date: endDate };
    if (departmentId) params.department_id = departmentId;
    
    const response = await api.get('/api/analytics/cost-analysis', { params });
    return response.data;
  },
};

// Resources API
export const resourcesApi = {
  // Departments
  getDepartments: async (params?: { skip?: number; limit?: number }) => {
    const response = await api.get('/api/resources/departments', { params });
    return response.data;
  },

  getDepartment: async (departmentId: string) => {
    const response = await api.get(`/api/resources/departments/${departmentId}`);
    return response.data;
  },

  createDepartment: async (departmentData: any) => {
    const response = await api.post('/api/resources/departments', departmentData);
    return response.data;
  },

  updateDepartment: async (departmentId: string, departmentData: any) => {
    const response = await api.put(`/api/resources/departments/${departmentId}`, departmentData);
    return response.data;
  },

  getDepartmentUtilization: async (departmentId: string) => {
    const response = await api.get(`/api/resources/departments/${departmentId}/utilization`);
    return response.data;
  },

  // Beds
  getBeds: async (params?: { department_id?: string; status?: string; skip?: number; limit?: number }) => {
    const response = await api.get('/api/resources/beds', { params });
    return response.data;
  },

  getBed: async (bedId: string) => {
    const response = await api.get(`/api/resources/beds/${bedId}`);
    return response.data;
  },

  createBed: async (bedData: any) => {
    const response = await api.post('/api/resources/beds', bedData);
    return response.data;
  },

  updateBed: async (bedId: string, bedData: any) => {
    const response = await api.put(`/api/resources/beds/${bedId}`, bedData);
    return response.data;
  },

  // Staff
  getStaff: async (params?: { department_id?: string; role?: string; is_active?: boolean; skip?: number; limit?: number }) => {
    const response = await api.get('/api/resources/staff', { params });
    return response.data;
  },

  getStaffMember: async (staffId: string) => {
    const response = await api.get(`/api/resources/staff/${staffId}`);
    return response.data;
  },

  createStaff: async (staffData: any) => {
    const response = await api.post('/api/resources/staff', staffData);
    return response.data;
  },

  updateStaff: async (staffId: string, staffData: any) => {
    const response = await api.put(`/api/resources/staff/${staffId}`, staffData);
    return response.data;
  },

  // Equipment
  getEquipment: async (params?: { department_id?: string; equipment_type?: string; status?: string; skip?: number; limit?: number }) => {
    const response = await api.get('/api/resources/equipment', { params });
    return response.data;
  },

  getEquipmentItem: async (equipmentId: string) => {
    const response = await api.get(`/api/resources/equipment/${equipmentId}`);
    return response.data;
  },

  createEquipment: async (equipmentData: any) => {
    const response = await api.post('/api/resources/equipment', equipmentData);
    return response.data;
  },

  updateEquipment: async (equipmentId: string, equipmentData: any) => {
    const response = await api.put(`/api/resources/equipment/${equipmentId}`, equipmentData);
    return response.data;
  },

  
};

export default api;






