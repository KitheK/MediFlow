// frontend/src/components/DoctorForm.tsx
import React, { useState } from 'react';

interface DoctorFormProps {
  onSubmit: (doctorData: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const DoctorForm: React.FC<DoctorFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    specialty: initialData?.specialty || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    experience: initialData?.experience || '',
    schedule: initialData?.schedule || '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const specialties = [
    'Cardiology',
    'Internal Medicine',
    'Pediatrics',
    'Surgery',
    'Orthopedics',
    'Neurology',
    'Oncology',
    'Dermatology',
    'Psychiatry',
    'Emergency Medicine',
    'Family Medicine',
    'Radiology'
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.specialty) newErrors.specialty = 'Specialty is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required';
    if (!formData.schedule.trim()) newErrors.schedule = 'Schedule is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="form-container">
      <h3>{initialData ? 'Edit Doctor' : 'Add New Doctor'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Dr. John Smith"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="specialty">Specialty *</label>
            <select
              id="specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className={errors.specialty ? 'error' : ''}
            >
              <option value="">Select Specialty</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            {errors.specialty && <span className="error-text">{errors.specialty}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="doctor@mediflow.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              placeholder="(555) 123-4567"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="experience">Experience *</label>
          <input
            type="text"
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className={errors.experience ? 'error' : ''}
            placeholder="5 years experience"
          />
          {errors.experience && <span className="error-text">{errors.experience}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="schedule">Schedule *</label>
          <input
            type="text"
            id="schedule"
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
            className={errors.schedule ? 'error' : ''}
            placeholder="Mon-Fri, 8:00 AM - 5:00 PM"
          />
          {errors.schedule && <span className="error-text">{errors.schedule}</span>}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span className="checkmark"></span>
            Active Status
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {initialData ? 'Update Doctor' : 'Add Doctor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;