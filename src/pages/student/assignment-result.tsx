import React, { useState, useMemo } from 'react';
import { FiCheck, FiX, FiDownload, FiFileText, FiMessageSquare, FiStar, FiCalendar, FiClock, FiAward, FiArrowLeft } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/router';
import { AuthenticatedPage } from '@/types';

const AssignmentResultPage: AuthenticatedPage = () => {
  const router = useRouter();
  const [showRubric, setShowRubric] = useState(false);

  // Mock assignment result data
  const assignmentResult = useMemo(() => ({
    id: '1',
    title: 'HTML Practice Exercise',
    course: 'Complete Web Development Bootcamp',
    submittedAt: '2024-03-15T14:30:00',
    gradedAt: '2024-03-18T10:15:00',
    status: 'graded', // 'pending', 'graded', 'late'
    score: 85,
    maxScore: 100,
    percentage: 85,
    grade: 'B+', // A+, A, A-, B+, B, B-, C+, C, C-, D, F
    feedback: {
      overall: 'Great work! You demonstrated a solid understanding of HTML fundamentals. Your code is well-structured and semantic. There are a few areas for improvement noted below.',
      strengths: [
        'Excellent use of semantic HTML5 elements',
        'Proper heading hierarchy (h1 → h2 → h3)',
        'Good accessibility with alt attributes',
        'Clean and well-indented code',
        'Meta tags properly implemented'
      ],
      improvements: [
        'Missing form validation attributes (required, type="email")',
        'Navigation could benefit from aria-label for better accessibility',
        'Consider adding more descriptive link text instead of "click here"',
        'Footer social links should open in new tabs with target="_blank"'
      ]
    },
    rubric: [
      { criterion: 'Semantic HTML Structure', score: 18, maxScore: 20, feedback: 'Great use of header, nav, section, footer' },
      { criterion: 'Navigation Implementation', score: 8, maxScore: 10, feedback: 'Works well, missing aria-label' },
      { criterion: 'About Section Content', score: 15, maxScore: 15, feedback: 'Excellent bio and presentation' },
      { criterion: 'Projects Section', score: 14, maxScore: 15, feedback: 'Good project cards, could use more detail' },
      { criterion: 'Contact Form', score: 18, maxScore: 20, feedback: 'Missing validation attributes' },
      { criterion: 'Meta Tags & SEO', score: 12, maxScore: 15, feedback: 'Good meta description, missing Open Graph' },
      { criterion: 'Code Quality', score: 10, maxScore: 10, feedback: 'Clean, well-commented code' },
      { criterion: 'Creativity & Design', score: 8, maxScore: 10, feedback: 'Good effort, could be more creative' }
    ],
    submission: {
      fileName: 'portfolio.html',
      fileSize: '4.2 KB',
      submittedText: null,
      comments: 'I tried my best to follow all the requirements. Please let me know if you need any clarifications.',
      attachments: [
        { name: 'portfolio.html', size: '4.2 KB', type: 'html' }
      ]
    },
    instructor: {
      name: 'John Doe',
      avatar: '',
      feedbackDate: '2024-03-18T10:15:00'
    },
    classStats: {
      averageScore: 78,
      highestScore: 98,
      lowestScore: 45,
      totalSubmissions: 156,
      yourRank: 23
    }
  }), []);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100';
    if (grade.startsWith('D')) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignment Result</h1>
            <p className="text-gray-600">{assignmentResult.title}</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/student/assignments')}>
            <FiArrowLeft className="mr-2" />
            Back to Assignments
          </Button>
        </div>

        {/* Grade Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${getGradeColor(assignmentResult.grade)}`}>
                <div className="text-center">
                  <div className="text-3xl font-bold">{assignmentResult.grade}</div>
                  <div className="text-xs">Grade</div>
                </div>
              </div>
              <div>
                <div className={`text-4xl font-bold ${getScoreColor(assignmentResult.percentage)}`}>
                  {assignmentResult.score}/{assignmentResult.maxScore}
                </div>
                <p className="text-gray-600">{assignmentResult.percentage}% Score</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <FiCalendar className="mr-1" />
                    Submitted: {new Date(assignmentResult.submittedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <FiClock className="mr-1" />
                    Graded: {new Date(assignmentResult.gradedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Button variant="outline" onClick={() => {}}>
                <FiDownload className="mr-2" />
                Download Feedback
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Feedback */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Feedback</h2>
              <p className="text-gray-700 mb-6">{assignmentResult.feedback.overall}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h3 className="font-medium text-green-800 mb-3 flex items-center">
                    <FiCheck className="mr-2" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {assignmentResult.feedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <FiCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h3 className="font-medium text-orange-800 mb-3 flex items-center">
                    <FiStar className="mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {assignmentResult.feedback.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <FiX className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Rubric Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Grading Rubric</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowRubric(!showRubric)}>
                  {showRubric ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>
              
              <div className="space-y-3">
                {assignmentResult.rubric.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{item.criterion}</span>
                      <span className={`font-bold ${getScoreColor((item.score / item.maxScore) * 100)}`}>
                        {item.score}/{item.maxScore}
                      </span>
                    </div>
                    {showRubric && (
                      <p className="text-sm text-gray-600">{item.feedback}</p>
                    )}
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (item.score / item.maxScore) >= 0.9 ? 'bg-green-500' :
                          (item.score / item.maxScore) >= 0.8 ? 'bg-blue-500' :
                          (item.score / item.maxScore) >= 0.7 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Submission</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiFileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{assignmentResult.submission.fileName}</p>
                      <p className="text-sm text-gray-500">{assignmentResult.submission.fileSize}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <FiDownload className="h-4 w-4" />
                  </Button>
                </div>
                
                {assignmentResult.submission.comments && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Your Comments:</strong> {assignmentResult.submission.comments}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Class Statistics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Class Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Class Average</span>
                  <span className="font-medium">{assignmentResult.classStats.averageScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Highest Score</span>
                  <span className="font-medium">{assignmentResult.classStats.highestScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Lowest Score</span>
                  <span className="font-medium">{assignmentResult.classStats.lowestScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Submissions</span>
                  <span className="font-medium">{assignmentResult.classStats.totalSubmissions}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Your Rank</span>
                    <span className="font-medium text-primary-600">#{assignmentResult.classStats.yourRank}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Graded By</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <FiFileText className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{assignmentResult.instructor.name}</p>
                  <p className="text-sm text-gray-600">Instructor</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push('/student/discussions')}>
                <FiMessageSquare className="mr-2" />
                Ask Question
              </Button>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <FiAward className="mr-2" />
                  View Certificate
                </Button>
                <Button className="w-full" onClick={() => router.push('/student/continue-learning')}>
                  Continue Learning
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

AssignmentResultPage.allowedRoles = ['student', 'instructor', 'admin'];
export default AssignmentResultPage;
