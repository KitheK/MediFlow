// frontend/src/components/AppointmentsSection.tsx
import React, { useState } from 'react';
import { appointmentsApi } from '../services/api.ts';
import AppointmentForm from '../components/AppointmentForm.tsx';
import { Appointment } from '../services/types.ts';

interface AppointmentsSectionProps {
  appointments: Appointment[];
  onAddAppointment: (appointmentData: any) => Promise<{ success: boolean; error?: string }>;
  onRefresh: () => void;
}

const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({ 
  appointments, 
  onAddAppointment, 
  onRefresh 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleSubmit = async (appointmentData: any) => {
    setFormError(null);
    setFormSuccess(null);
    
    const result = await onAddAppointment(appointmentData);
    
    if (result.success) {
      setFormSuccess('Appointment scheduled successfully!');
      setShowForm(false);
      setTimeout(() => onRefresh(), 1000);
    } else {
      setFormError(result.error || 'Failed to schedule appointment');
    }
  };

  const handleReschedule = async (appointmentId: string, newDateTime: string) => {
    try {
      await appointmentsApi.rescheduleAppointment(appointmentId, newDateTime);
      setFormSuccess('Appointment rescheduled successfully!');
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to reschedule appointment');
    }
  };

  const handleStatusChange = async (appointmentId: string, status: string) => {
    try {
      await appointmentsApi.updateAppointmentStatus(appointmentId, status);
      setFormSuccess('Appointment status updated successfully!');
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update appointment status');
    }
  };

  return (
    <section id="appointments" className="section active">
      <div className="section-header">
        <h2>Appointment Management</h2>
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
            <i className="fas fa-calendar-plus"></i>
            Schedule New Appointment
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
        <AppointmentForm 
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appointment => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.patientName}</td>
                  <td>{appointment.doctorName}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.department}</td>
                  <td>
                    <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => {
                        const newDateTime = prompt('Enter new date and time:');
                        if (newDateTime) {
                          handleReschedule(appointment.id, newDateTime);
                        }
                      }}
                    >
                      Reschedule
                    </button>
                    <select
                      className="btn btn-sm"
                      value={appointment.status}
                      onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                      style={{ marginLeft: '5px', padding: '0.2rem 0.5rem' }}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Appointment Details</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedAppointment(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p><strong>ID:</strong> {selectedAppointment.id}</p>
              <p><strong>Patient:</strong> {selectedAppointment.patientName}</p>
              <p><strong>Doctor:</strong> {selectedAppointment.doctorName}</p>
              <p><strong>Date & Time:</strong> {selectedAppointment.date}</p>
              <p><strong>Department:</strong> {selectedAppointment.department}</p>
              <p><strong>Status:</strong> 
                <span className={`status-badge status-${selectedAppointment.status.toLowerCase()}`}>
                  {selectedAppointment.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AppointmentsSection;