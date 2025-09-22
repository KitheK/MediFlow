export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    experience: string;
    email: string;
    phone: string;
    schedule: string;
    isActive: boolean;
}

export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    contact: string;
    diagnosis: string;
    lastVisit: string;
    nextAppointment?: string;
}
export interface DepartmentPerformance {
  department_name: string;
  occupancy_rate: number;
  patient_satisfaction: number;
  // Add other fields you expect from the API
}

export interface DepartmentData {
  name: string;
  occupancy: number;
  satisfaction: number;
}
export interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    department: string;
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
}

export interface DashboardStats {
    
    patientStats: {
        total: number;
        new: number;
        active: number;
        discharged: number;
    };
    appointmentStats: {
        today: number;
        upcoming: number;
        completed: number;
        cancelled: number;
    };
    resourceStats: {
        occupancyRate: number;
        availableBeds: number;
        totalStaff: number;
        activeShifts: number;
    };
    revenueStats: {
        daily: number;
        weekly: number;
        monthly: number;
        yearToDate: number;
    };
    performanceMetrics: {
        averageWaitTime: number;
        patientSatisfaction: number;
        treatmentSuccess: number;
        readmissionRate: number;
    };

}