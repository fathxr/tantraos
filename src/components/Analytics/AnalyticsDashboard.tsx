import React from 'react';
import { useDataStore } from '../../store/dataStore';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  Clock
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { analytics } = useDataStore();

  const revenueData = [
    { period: 'Jan', amount: 28000 },
    { period: 'Feb', amount: 32000 },
    { period: 'Mar', amount: 29000 },
    { period: 'Apr', amount: 35000 },
    { period: 'May', amount: 38000 },
    { period: 'Jun', amount: 42000 },
  ];

  const clientGrowth = [
    { month: 'Jan', new: 12, returning: 45 },
    { month: 'Feb', new: 18, returning: 52 },
    { month: 'Mar', new: 15, returning: 48 },
    { month: 'Apr', new: 22, returning: 58 },
    { month: 'May', new: 28, returning: 65 },
    { month: 'Jun', new: 25, returning: 72 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your business performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₪{analytics.revenue.monthly.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.5% from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.clients.active}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600">+8.2% from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Appointments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.appointments.total}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm text-purple-600">+15.3% from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Staff Utilization</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.staff.utilization}%
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600">+5.1% from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {revenueData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg"
                  style={{ height: `${(data.amount / 45000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{data.period}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Client Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Client Growth</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {clientGrowth.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
                    style={{ height: `${(data.returning / 80) * 150}px` }}
                  ></div>
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-300"
                    style={{ height: `${(data.new / 30) * 50}px` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Returning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">New</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appointment Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.appointments.completed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.appointments.pending}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.appointments.cancelled}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Client Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Clients</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.clients.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">New This Month</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.clients.new}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Returning</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.clients.returning}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Daily Average</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ₪{analytics.revenue.daily.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Weekly</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ₪{analytics.revenue.weekly.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Yearly Projection</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ₪{analytics.revenue.yearly.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};