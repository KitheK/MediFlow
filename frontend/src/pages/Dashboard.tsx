import React from 'react';
import { useQuery } from 'react-query';
import { analyticsApi, patientsApi, appointmentsApi, doctorsApi } from '../services/api.ts';
import { 
  Users, 
  Bed, 
  TrendingUp, 
  Heart, 
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Patient, Appointment, Doctor, DashboardStats,DepartmentPerformance,DepartmentData} from '../services/types.ts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export const Dashboard: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading } = useQuery(
    'dashboard-metrics',
    analyticsApi.getDashboardMetrics,
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  const { data: occupancyTrends } = useQuery(
    'occupancy-trends',
    () => analyticsApi.getOccupancyTrends(7),
    { refetchInterval: 60000 }
  );

  const { data: DepartmentPerformance } = useQuery(
    'department-performance',
    analyticsApi.getDepartmentPerformance
  );

  const { data: resourceUtilization } = useQuery(
    'resource-utilization',
    analyticsApi.getResourceUtilization
  );

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Patients',
      value: metrics?.total_patients || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Current Occupancy',
      value: `${metrics?.current_occupancy_rate || 0}%`,
      icon: Bed,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Avg Length of Stay',
      value: `${metrics?.average_length_of_stay || 0} days`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Readmission Rate',
      value: `${metrics?.readmission_rate || 0}%`,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Patient Satisfaction',
      value: `${metrics?.patient_satisfaction_score || 0}/5`,
      icon: CheckCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Profit Margin',
      value: `${metrics?.profit_margin || 0}%`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  // Add loading and error states to your query
const { data: departmentPerformance, isLoading, error } = useQuery({
  queryKey: ['departmentPerformance'],
  queryFn: analyticsApi.getDepartmentPerformance
});

// Now use departmentPerformance (lowercase d)
const departmentData: DepartmentData[] = (departmentPerformance || []).slice(0, 5).map((dept: DepartmentPerformance) => ({
  name: dept.department_name,
  occupancy: dept.occupancy_rate,
  satisfaction: dept.patient_satisfaction,
}));

// Handle loading state
if (isLoading) {
  return <div>Loading department data...</div>;
}

// Handle error state
if (error) {
  return <div>Error loading department data:</div>;
}

  const resourceData = resourceUtilization ? [
    { name: 'Beds', value: resourceUtilization.bed_occupancy_rate, color: '#3b82f6' },
    { name: 'Staff', value: resourceUtilization.staff_utilization_rate, color: '#10b981' },
    { name: 'Equipment', value: resourceUtilization.equipment_utilization_rate, color: '#f59e0b' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of hospital operations and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((card, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bed Occupancy Trends (7 days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`${value}%`, 'Occupancy Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="occupancy" fill="#3b82f6" name="Occupancy Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
          <div className="space-y-3">
            {resourceUtilization?.maintenance_due_count > 0 && (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {resourceUtilization.maintenance_due_count} equipment items due for maintenance
                  </p>
                </div>
              </div>
            )}
            
            {resourceUtilization?.equipment_out_of_order_count > 0 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {resourceUtilization.equipment_out_of_order_count} equipment items out of order
                  </p>
                </div>
              </div>
            )}

            {metrics?.readmission_rate > 15 && (
              <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    High readmission rate detected ({metrics.readmission_rate}%)
                  </p>
                </div>
              </div>
            )}

            {(!resourceUtilization?.maintenance_due_count && 
              !resourceUtilization?.equipment_out_of_order_count && 
              metrics?.readmission_rate <= 15) && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    All systems operating normally
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;





