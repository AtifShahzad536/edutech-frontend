import React, { useState } from 'react';
import { FiUser, FiMail, FiCamera, FiEdit, FiSave, FiAward, FiBook, FiStar, FiUsers } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { AuthenticatedPage } from '@/types';

const TeacherProfilePage: AuthenticatedPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    title: 'Expert Instructor',
    bio: '',
    expertise: ['React', 'Node.js', 'JavaScript'],
    website: '',
    linkedin: '',
    twitter: '',
    location: ''
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setProfileData(prev => ({
            ...prev,
            ...result.user,
            firstName: result.user.firstName || '',
            lastName: result.user.lastName || '',
            email: result.user.email || '',
            bio: result.user.bio || 'Passionate educator.',
          }));
        }
      } catch (error) {
        console.error('Failed to fetch instructor profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const result = await response.json();
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const stats = {
    totalStudents: 15420,
    totalCourses: 8,
    averageRating: 4.8,
    totalReviews: 3240
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <FiUser className="h-12 w-12 text-gray-400" />
              </div>
              <button className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700">
                <FiCamera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <p className="text-gray-600">{profileData.title}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  <FiEdit className="mr-2" />
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{stats.totalCourses}</div>
                  <div className="text-sm text-gray-600">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-primary-600">{stats.averageRating}</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{stats.totalReviews.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About Me</h2>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-gray-700">{profileData.bio}</p>
              )}
            </div>

            {/* Expertise */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Areas of Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FiMail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{profileData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiUsers className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{profileData.linkedin}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiStar className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{profileData.website}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Edit Form */}
            {isEditing && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Edit Profile</h3>
                <div className="space-y-4">
                  <Input
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  />
                  <Input
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  />
                  <Input
                    label="Title"
                    value={profileData.title}
                    onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                  />
                  <Input
                    label="Website"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  />
                  <Button onClick={handleSave} className="w-full">
                    <FiSave className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FiBook className="h-5 w-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Published New Course</p>
                    <p className="text-xs text-gray-500">Advanced React Patterns - 3 days ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiUsers className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">150 New Students</p>
                    <p className="text-xs text-gray-500">This week</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiStar className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New 5-Star Review</p>
                    <p className="text-xs text-gray-500">Complete Web Development - 1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

TeacherProfilePage.allowedRoles = ['instructor', 'admin'];
export default TeacherProfilePage;
