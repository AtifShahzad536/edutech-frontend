import React, { useState, useMemo } from 'react';
import { FiBell, FiCheck, FiX, FiFilter, FiCalendar, FiBook, FiMessageSquare, FiAward, FiDollarSign } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { AuthenticatedPage } from '@/types';

const StudentNotificationsPage: AuthenticatedPage = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'course',
      title: 'New course available: Advanced React Patterns',
      message: 'Check out our latest course on advanced React patterns and best practices.',
      timestamp: '2 hours ago',
      read: false,
      icon: FiBook,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: { text: 'View Course', url: '/student/courses' }
    },
    {
      id: 2,
      type: 'assignment',
      title: 'Assignment graded: JavaScript Fundamentals',
      message: 'Your assignment has been graded. You scored 85/100!',
      timestamp: '5 hours ago',
      read: false,
      icon: FiAward,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      action: { text: 'View Feedback', url: '/student/assignments' }
    },
    {
      id: 3,
      type: 'discussion',
      title: 'New reply to your discussion post',
      message: 'Sarah Chen replied to your question about async/await in React hooks.',
      timestamp: '1 day ago',
      read: true,
      icon: FiMessageSquare,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: { text: 'View Reply', url: '/student/discussions' }
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment successful',
      message: 'Your payment for Complete Web Development Bootcamp was successful.',
      timestamp: '2 days ago',
      read: true,
      icon: FiDollarSign,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      action: { text: 'View Receipt', url: '/payment/success' }
    },
    {
      id: 5,
      type: 'reminder',
      title: 'Course reminder: Complete Web Development',
      message: 'You haven\'t accessed this course in 3 days. Continue your learning journey!',
      timestamp: '3 days ago',
      read: true,
      icon: FiCalendar,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      action: { text: 'Continue Learning', url: '/student/learning/1' }
    },
    {
      id: 6,
      type: 'course',
      title: 'Course updated: UI/UX Design Fundamentals',
      message: 'New content has been added to your enrolled course.',
      timestamp: '1 week ago',
      read: true,
      icon: FiBook,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: { text: 'View Course', url: '/student/my-courses' }
    },
  ]);

  const filterOptions = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread' },
    { value: 'course', label: 'Course Updates' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'discussion', label: 'Discussions' },
    { value: 'payment', label: 'Payments' },
  ];

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'all') {
      return notifications;
    }
    if (selectedFilter === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications.filter(n => n.type === selectedFilter);
  }, [notifications, selectedFilter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select
              options={filterOptions}
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            />
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <FiCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border ${
                  notification.read ? 'border-gray-200' : 'border-primary-200 bg-primary-50'
                } p-6 transition-all duration-200`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 ${notification.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <notification.icon className={`h-5 w-5 ${notification.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`font-semibold ${
                          notification.read ? 'text-gray-900' : 'text-primary-900'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm ${
                          notification.read ? 'text-gray-600' : 'text-primary-700'
                        } mt-1`}>
                          {notification.message}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <FiCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <FiX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-500">{notification.timestamp}</span>
                      {notification.action && (
                        <Button variant="outline" size="sm" href={notification.action.url}>
                          {notification.action.text}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedFilter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedFilter === 'unread' 
                ? 'All your notifications have been read.'
                : 'You\'re all caught up! No new notifications.'
              }
            </p>
            {selectedFilter !== 'all' && (
              <Button variant="outline" onClick={() => setSelectedFilter('all')}>
                View All Notifications
              </Button>
            )}
          </div>
        )}

        {/* Settings */}
        {filteredNotifications.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive email updates about your courses and assignments</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Get notified about important updates in your browser</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Course Updates</p>
                  <p className="text-sm text-gray-600">Notifications about new course content and updates</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

StudentNotificationsPage.allowedRoles = ['student', 'instructor', 'admin'];
export default StudentNotificationsPage;
