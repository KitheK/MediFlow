// frontend/src/components/DoctorsSection.tsx
import React, { useState } from 'react';
import { doctorsApi } from '../services/api.ts';
import DoctorForm from '../components/DoctorForm';
import { Doctor } from '../services/types.ts';

interface DoctorsSectionProps {
  doctors: Doctor[];
  onAddDoctor: (doctorData: any) => Promise<{ success: boolean; error?: string }>;
  onRefresh: () => void;
}

const DoctorsSection: React.FC<DoctorsSectionProps> = ({ 
  doctors, 
  onAddDoctor, 
  onRefresh 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const handleSubmit = async (doctorData: any) => {
    setFormError(null);
    setFormSuccess(null);
    
    const result = await onAddDoctor(doctorData);
    
    if (result.success) {
      setFormSuccess('Doctor added successfully!');
      setShowForm(false);
      setTimeout(() => onRefresh(), 1000);
    } else {
      setFormError(result.error || 'Failed to add doctor');
    }
  };

  const handleStatusChange = async (doctorId: string, isActive: boolean) => {
    try {
      await doctorsApi.updateDoctor(doctorId, { is_active: isActive });
      setFormSuccess('Doctor status updated successfully!');
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update doctor status');
    }
  };

  return (
    <section id="doctors" className="section active">
      <div className="section-header">
        <h2>Medical Staff Management</h2>
        <div>
          <button className="btn btn-secondary" onClick={onRefresh}>
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(!showForm)}
            style={{ marginLeft: '10px' }}
          >
            <i className="fas fa-user-plus"></i>
            Add New Doctor
          </button>
        </div>
      </div>

      {formError && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {formSuccess}
        </div>
      )}

      {showForm && (
        <DoctorForm 
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="doctors-grid">
        {doctors.map(doctor => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-avatar">
              <i className="fas fa-user-md"></i>
            </div>
            <div className="doctor-info">
              <h3>{doctor.name}</h3>
              <p className="doctor-specialty">{doctor.specialty}</p>
              <p className="doctor-experience">{doctor.experience}</p>
              <div className="doctor-contact">
                <p><i className="fas fa-envelope"></i> {doctor.email}</p>
                <p><i className="fas fa-phone"></i> {doctor.phone}</p>
              </div>
              <div className="doctor-schedule">
                <p><strong>Schedule:</strong> {doctor.schedule}</p>
              </div>
              <div className="doctor-status">
                <span className={`status-badge status-${doctor.isActive ? 'active' : 'inactive'}`}>
                  {doctor.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="doctor-actions">
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => setSelectedDoctor(doctor)}
              >
                View Profile
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  // Toggle active status
                  handleStatusChange(doctor.id, !doctor.isActive);
                }}
              >
                {doctor.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Doctor Profile</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedDoctor(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="doctor-detail">
                <div className="doctor-avatar-large">
                  <i className="fas fa-user-md"></i>
                </div>
                <div className="doctor-detail-info">
                  <h3>{selectedDoctor.name}</h3>
                  <p><strong>Specialty:</strong> {selectedDoctor.specialty}</p>
                  <p><strong>Experience:</strong> {selectedDoctor.experience}</p>
                  <p><strong>Email:</strong> {selectedDoctor.email}</p>
                  <p><strong>Phone:</strong> {selectedDoctor.phone}</p>
                  <p><strong>Schedule:</strong> {selectedDoctor.schedule}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge status-${selectedDoctor.isActive ? 'active' : 'inactive'}`}>
                      {selectedDoctor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DoctorsSection;