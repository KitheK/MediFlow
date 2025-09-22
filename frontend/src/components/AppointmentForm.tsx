// frontend/src/components/AppointmentForm.tsx
import React, { useState, useEffect } from 'react';
import { patientsApi, doctorsApi } from '../services/api.ts';

interface AppointmentFormProps {
  onSubmit: (appointmentData: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    patient_id: initialData?.patient_id || '',
    doctor_id: initialData?.doctor_id || '',
    scheduled_date: initialData?.scheduled_date || '',
    scheduled_time: initialData?.scheduled_time || '',
    type: initialData?.type || 'consultation',
    reason: initialData?.reason || '',
    department: initialData?.department || ''
  });

  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const appointmentTypes = [
    'consultation',
    'follow-up',
    'check-up',
    'emergency',
    'surgery',
    'therapy',
    'screening',
    'vaccination'
  ];

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [patientsData, doctorsData] = await Promise.all([
        patientsApi.getPatients(),
        doctorsApi.getDoctors()
      ]);
      setPatients(patientsData);
      setDoctors(doctorsData.filter((doctor: any) => doctor.isActive));
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.patient_id) newErrors.patient_id = 'Patient is required';
    if (!formData.doctor_id) newErrors.doctor_id = 'Doctor is required';
    if (!formData.scheduled_date) newErrors.scheduled_date = 'Date is required';
    if (!formData.scheduled_time) newErrors.scheduled_time = 'Time is required';
    if (!formData.type) newErrors.type = 'Appointment type is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const appointmentData = {
        ...formData,
        scheduled_datetime: `${formData.scheduled_date}T${formData.scheduled_time}:00`
      };
      onSubmit(appointmentData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doctorId = e.target.value;
    const selectedDoctor = doctors.find(doctor => doctor.id === doctorId);
    
    setFormData(prev => ({
      ...prev,
      doctor_id: doctorId,
      department: selectedDoctor?.specialty || ''
    }));
  };

  if (loading) {
    return (
      <div className="form-container">
        <div className="loading">Loading form data...</div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h3>{initialData ? 'Edit Appointment' : 'Schedule New Appointment'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patient_id">Patient *</label>
            <select
              id="patient_id"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              className={errors.patient_id ? 'error' : ''}
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} (ID: {patient.id})
                </option>
              ))}
            </select>
            {errors.patient_id && <span className="error-text">{errors.patient_id}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="doctor_id">Doctor *</label>
            <select
              id="doctor_id"
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleDoctorChange}
              className={errors.doctor_id ? 'error' : ''}
            >
              <option value="">Select Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} ({doctor.specialty})
                </option>
              ))}
            </select>
            {errors.doctor_id && <span className="error-text">{errors.doctor_id}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="scheduled_date">Date *</label>
            <input
              type="date"
              id="scheduled_date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              className={errors.scheduled_date ? 'error' : ''}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.scheduled_date && <span className="error-text">{errors.scheduled_date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="scheduled_time">Time *</label>
            <input
              type="time"
              id="scheduled_time"
              name="scheduled_time"
              value={formData.scheduled_time}
              onChange={handleChange}
              className={errors.scheduled_time ? 'error' : ''}
            />
            {errors.scheduled_time && <span className="error-text">{errors.scheduled_time}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Appointment Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={errors.type ? 'error' : ''}
            >
              <option value="">Select Type</option>
              {appointmentTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
            {errors.type && <span className="error-text">{errors.type}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              readOnly
              className="read-only"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason for Visit *</label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className={errors.reason ? 'error' : ''}
            rows={3}
            placeholder="Describe the reason for this appointment..."
          />
          {errors.reason && <span className="error-text">{errors.reason}</span>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {initialData ? 'Update Appointment' : 'Schedule Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;