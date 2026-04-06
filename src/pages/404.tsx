import React from 'react';
import { FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const NotFoundPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic
    window.location.href = `/student/courses?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-9xl font-bold text-gray-200">404</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl">😕</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <form onSubmit={handleSearch} className="flex">
              <Input
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startIcon={<FiSearch className="h-5 w-5 text-gray-400" />}
                className="flex-1"
              />
              <Button type="submit" className="ml-2">
                Search
              </Button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button href="/" className="flex items-center justify-center">
              <FiHome className="h-4 w-4 mr-2" />
              Go Home
            </Button>
            <Button variant="outline" href="/student/courses" className="flex items-center justify-center">
              <FiSearch className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center justify-center">
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Looking for something?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Popular Courses</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><a href="/student/courses" className="text-primary-600 hover:text-primary-500">Complete Web Development</a></li>
                  <li><a href="/student/courses" className="text-primary-600 hover:text-primary-500">Advanced React Patterns</a></li>
                  <li><a href="/student/courses" className="text-primary-600 hover:text-primary-500">UI/UX Design Fundamentals</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Quick Links</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><a href="/student/dashboard" className="text-primary-600 hover:text-primary-500">Student Dashboard</a></li>
                  <li><a href="/instructor/dashboard" className="text-primary-600 hover:text-primary-500">Instructor Dashboard</a></li>
                  <li><a href="/admin/dashboard" className="text-primary-600 hover:text-primary-500">Admin Dashboard</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Still can't find what you're looking for?
            </p>
            <a href="#" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default NotFoundPage;
