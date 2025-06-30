import React, { useState } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  AlertTriangle, 
  Key, 
  Eye, 
  Lock,
  Users,
  Activity,
  FileText,
  Settings
} from 'lucide-react';

export const SecurityCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const securityMetrics = {
    threatLevel: 'Low',
    activeUsers: 127,
    failedLogins: 3,
    dataEncryption: '100%',
    lastAudit: '2024-01-15',
    complianceScore: 98
  };

  const recentActivity = [
    {
      id: '1',
      type: 'login',
      user: 'admin@tantraos.com',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'success',
      ip: '192.168.1.100'
    },
    {
      id: '2',
      type: 'failed_login',
      user: 'unknown@example.com',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'blocked',
      ip: '203.0.113.1'
    },
    {
      id: '3',
      type: 'data_access',
      user: 'staff@tantraos.com',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'success',
      ip: '192.168.1.101'
    }
  ];

  const complianceChecks = [
    { name: 'Data Encryption', status: 'passed', description: 'All data encrypted at rest and in transit' },
    { name: 'Access Controls', status: 'passed', description: 'Role-based access control implemented' },
    { name: 'Audit Logging', status: 'passed', description: 'Comprehensive audit trail maintained' },
    { name: 'Backup Security', status: 'passed', description: 'Encrypted backups with retention policy' },
    { name: 'Network Security', status: 'warning', description: 'Firewall rules need review' },
    { name: 'User Authentication', status: 'passed', description: 'Multi-factor authentication enabled' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <ShieldCheck className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <Shield className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Key className="w-4 h-4 text-green-500" />;
      case 'failed_login':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'data_access':
        return <Eye className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Center</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor and manage your system security</p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Threat Level</p>
              <p className="text-2xl font-bold text-green-600">{securityMetrics.threatLevel}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{securityMetrics.activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed Logins</p>
              <p className="text-2xl font-bold text-red-600">{securityMetrics.failedLogins}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Score</p>
              <p className="text-2xl font-bold text-green-600">{securityMetrics.complianceScore}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Security Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.type.replace('_', ' ').toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.user} from {activity.ip}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    activity.status === 'success' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Checks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Status</h3>
          <div className="space-y-4">
            {complianceChecks.map((check, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {check.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {check.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left">
            <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Update Passwords</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">Force password reset for all users</p>
          </button>
          <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left">
            <FileText className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <p className="text-sm font-medium text-green-900 dark:text-green-100">Generate Report</p>
            <p className="text-xs text-green-700 dark:text-green-300">Create security audit report</p>
          </button>
          <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left">
            <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Security Settings</p>
            <p className="text-xs text-purple-700 dark:text-purple-300">Configure security policies</p>
          </button>
        </div>
      </div>
    </div>
  );
};