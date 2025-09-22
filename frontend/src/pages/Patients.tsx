import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { patientsApi } from '../services/api.ts';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  User,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Patients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: patients, isLoading } = useQuery(
    ['patients', searchTerm],
    () => patientsApi.getPatients({ search: searchTerm || undefined }),
    { keepPreviousData: true }
  );

  const deletePatientMutation = useMutation(
    (patientId: string) => patientsApi.deletePatient(patientId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patients');
        toast.success('Patient deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete patient');
      },
    }
  );

  const handleDelete = (patientId: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      deletePatientMutation.mutate(patientId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage patient records and information</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Insurance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients?.map((patient: any) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.gender} • {new Date(patient.date_of_birth).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.patient_id}</div>
                    {patient.medical_record_number && (
                      <div className="text-sm text-gray-500">MRN: {patient.medical_record_number}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {patient.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-400" />
                          {patient.phone}
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {patient.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.insurance_provider || 'N/A'}</div>
                    {patient.insurance_number && (
                      <div className="text-sm text-gray-500">{patient.insurance_number}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {/* Handle edit */}}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {patients?.length === 0 && (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new patient.'}
            </p>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Patient</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-input" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Patient ID</label>
                  <input type="text" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select className="form-select">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input type="tel" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Patient ID</label>
                  <p className="text-sm text-gray-900">{selectedPatient.patient_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedPatient.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedPatient.gender}</p>
                </div>
                {selectedPatient.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{selectedPatient.phone}</p>
                  </div>
                )}
                {selectedPatient.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{selectedPatient.email}</p>
                  </div>
                )}
                {selectedPatient.insurance_provider && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Insurance</label>
                    <p className="text-sm text-gray-900">{selectedPatient.insurance_provider}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;






