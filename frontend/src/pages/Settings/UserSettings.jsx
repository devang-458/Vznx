import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';

export default function UserSettings() {
  const { user } = useUserAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    emailNotifications: true,
    pushNotifications: true,
    weekStartsOn: 'monday'
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    taskDueSoon: true,
    taskCompleted: false,
    mentionedInComment: true,
    dailyDigest: true,
    weeklyReport: false
  });

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
    setProfileData({ name: user?.name || '', email: user?.email || '' });
  }, [user]);

  const loadPreferences = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SETTINGS.GET_PREFERENCES);
      if (response.data?.data) {
        setPreferences(response.data.data.preferences || preferences);
        setNotifications(response.data.data.notificationSettings || notifications);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        API_PATHS.SETTINGS.UPDATE_PROFILE,
        profileData
      );
      showMessage('Profile updated successfully!', 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('Passwords do not match!', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters!', 'error');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.put(API_PATHS.SETTINGS.UPDATE_PROFILE, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showMessage('Password updated successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showMessage(error.response?.data?.message || 'Error updating password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put(API_PATHS.SETTINGS.UPDATE_PREFERENCES, {
        preferences,
        notificationSettings: notifications
      });
      showMessage('Preferences updated successfully!', 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Error updating preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This will delete your account permanently.')) {
      return;
    }
    const confirmation = prompt('Type DELETE MY ACCOUNT to confirm:');
    if (confirmation !== 'DELETE MY ACCOUNT') {
      showMessage('Account deletion cancelled', 'error');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.delete(API_PATHS.SETTINGS.DELETE_ACCOUNT, {
        data: { confirmation }
      });
      showMessage('Account deleted successfully. Redirecting...', 'success');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Error deleting account', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.SETTINGS.EXPORT_DATA);
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `user-data-${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      showMessage('Data exported successfully!', 'success');
    } catch (error) {
      showMessage('Error exporting data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'privacy', label: 'Privacy & Data' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex flex-row justify-between">
            <div className=''>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-blue-100 text-sm mt-1">Manage your account and preferences</p>
            </div>
            <div>
              <button>hi</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`px-6 py-3 font-medium ${messageType === 'error'
                ? 'bg-red-50 text-red-700 border-l-4 border-red-400'
                : 'bg-green-50 text-green-700 border-l-4 border-green-400'
                }`}
            >
              {message}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your new password"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleUpdatePreferences} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>

                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Notification Channels</p>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Email Notifications</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Push Notifications</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Notification Types</p>
                  {Object.entries(notifications).map(([key, value]) => (
                    <label key={key} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    {loading ? 'Saving...' : 'Save Notification Settings'}
                  </button>
                </div>
              </form>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <form onSubmit={handleUpdatePreferences} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">App Preferences</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern (EST)</option>
                    <option value="America/Chicago">Central (CST)</option>
                    <option value="America/Denver">Mountain (MST)</option>
                    <option value="America/Los_Angeles">Pacific (PST)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="Australia/Sydney">Sydney (AEDT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Week Starts On</label>
                  <select
                    value={preferences.weekStartsOn}
                    onChange={(e) => setPreferences({ ...preferences, weekStartsOn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </form>
            )}

            {/* Privacy & Data Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Data</h2>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-2">Export Your Data</h3>
                  <p className="text-sm text-gray-600 mb-4">Download all your data including tasks, comments, and preferences in JSON format for backup or migration.</p>
                  <button
                    onClick={handleExportData}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    {loading ? 'Exporting...' : '📥 Download My Data'}
                  </button>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-2">Delete Your Account</h3>
                  <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    {loading ? 'Deleting...' : '🗑️ Delete My Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
