import React from 'react';
import { useDataStore } from '../../store/dataStore';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { analytics, appointments, clients } = useDataStore();

  const stats = [
    {
      title: 'Total Revenue',
      value: `₪${analytics.revenue.monthly.toLocaleString()}`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Active Clients',
      value: analytics.clients.active.toString(),
      change: '+8.2%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Appointments',
      value: analytics.appointments.total.toString(),
      change: '+15.3%',
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      title: 'Staff Utilization',
      value: `${analytics.staff.utilization}%`,
      change: '+5.1%',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  const recentAppointments = [
    {
      id: '1',
      client: 'Sarah Cohen',
      service: 'Tantric Massage',
      time: '14:00',
      status: 'confirmed',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40'
    },
    {
      id: '2',
      client: 'Elena Petrov',
      service: 'Energy Healing',
      time: '16:30',
      status: 'pending',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=40'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Appointments</h3>
          <div className="space-y-4">
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={appointment.avatar}
                  alt={appointment.client}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{appointment.client}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{appointment.time}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {getStatusIcon(appointment.status)}
                    <span className="text-xs capitalize text-gray-600 dark:text-gray-400">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">New Appointment</p>
            </button>
            <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Add Client</p>
            </button>
            <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
              <p className="text-sm font-medium text-green-900 dark:text-green-100">View Revenue</p>
            </button>
            <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Analytics</p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Sarah Cohen completed her session</span>
            <span className="text-gray-400 dark:text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">New client Elena Petrov registered</span>
            <span className="text-gray-400 dark:text-gray-500">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Payment received from David Miller</span>
            <span className="text-gray-400 dark:text-gray-500">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};