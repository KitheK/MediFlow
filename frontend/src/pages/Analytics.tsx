import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { analyticsApi } from '../services/api.ts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart, 
  DollarSign,
  Calendar,
  Filter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const { data: dashboardMetrics } = useQuery(
    'dashboard-metrics',
    analyticsApi.getDashboardMetrics
  );

  const { data: occupancyTrends } = useQuery(
    ['occupancy-trends', selectedPeriod],
    () => analyticsApi.getOccupancyTrends(selectedPeriod)
  );

  const { data: readmissionTrends } = useQuery(
    ['readmission-trends', selectedPeriod],
    () => analyticsApi.getReadmissionTrends(selectedPeriod)
  );

  const { data: departmentPerformance } = useQuery(
    'department-performance',
    analyticsApi.getDepartmentPerformance
  );

  const { data: patientOutcomes } = useQuery(
    'patient-outcomes',
    analyticsApi.getPatientOutcomeSummary
  );

  const { data: resourceUtilization } = useQuery(
    'resource-utilization',
    analyticsApi.getResourceUtilization
  );

  const { data: costAnalysis } = useQuery(
    ['cost-analysis', selectedPeriod],
    () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - selectedPeriod);
      return analyticsApi.getCostAnalysis(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        selectedDepartment || undefined
      );
    }
  );

  const outcomeData = patientOutcomes ? [
    { name: 'Recovery', value: patientOutcomes.recovery_rate, color: '#10b981' },
    { name: 'Mortality', value: patientOutcomes.mortality_rate, color: '#ef4444' },
    { name: 'Complications', value: patientOutcomes.complication_rate, color: '#f59e0b' },
  ] : [];

 interface DepartmentPerformance {
  department_name: string;
  occupancy_rate: number;
  patient_satisfaction: number;
  readmission_rate: number;
  cost_efficiency: number;
}

const departmentData = departmentPerformance?.map((dept: DepartmentPerformance) => ({
  name: dept.department_name,
  occupancy: dept.occupancy_rate,
  satisfaction: dept.patient_satisfaction,
  readmission: dept.readmission_rate,
  efficiency: dept.cost_efficiency,
})) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Comprehensive healthcare analytics and insights</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="form-select"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="form-select"
          >
            <option value="">All Departments</option>
           {departmentPerformance?.map((dept: any) => (
  <option key={dept.department_id} value={dept.department_id}>
    {dept.department_name}
  </option>
))}
          </select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics?.total_patients || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recovery Rate</p>
              <p className="text-2xl font-bold text-gray-900">{patientOutcomes?.recovery_rate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Readmission Rate</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics?.readmission_rate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics?.profit_margin || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bed Occupancy Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyTrends}>
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
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Readmission Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readmissionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [value, 'Readmissions']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="occupancy" fill="#3b82f6" name="Occupancy Rate (%)" />
              <Bar dataKey="satisfaction" fill="#10b981" name="Satisfaction Score" />
              <Bar dataKey="readmission" fill="#ef4444" name="Readmission Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Patient Outcomes and Resource Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Outcomes Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Bed Occupancy</span>
              <span className="text-sm font-bold text-gray-900">
                {resourceUtilization?.bed_occupancy_rate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${resourceUtilization?.bed_occupancy_rate || 0}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Staff Utilization</span>
              <span className="text-sm font-bold text-gray-900">
                {resourceUtilization?.staff_utilization_rate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${resourceUtilization?.staff_utilization_rate || 0}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Equipment Utilization</span>
              <span className="text-sm font-bold text-gray-900">
                {resourceUtilization?.equipment_utilization_rate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full" 
                style={{ width: `${resourceUtilization?.equipment_utilization_rate || 0}%` }}
              ></div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Maintenance Alerts</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Due for Maintenance</span>
                  <span className="font-medium">{resourceUtilization?.maintenance_due_count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Out of Order</span>
                  <span className="font-medium">{resourceUtilization?.equipment_out_of_order_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      {costAnalysis && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-blue-600">
                ${costAnalysis.total_cost.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${costAnalysis.total_revenue.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-purple-600">
                ${costAnalysis.total_profit.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-yellow-600">
                {costAnalysis.profit_margin.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Analytics;





