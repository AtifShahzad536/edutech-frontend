export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  enrolledCourses?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  _id?: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  instructorId?: string;
  instructor?: User;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  lessonsCount?: number;
  studentsCount: number;
  rating: number;
  reviewsCount: number;
  features?: string[];
  isPublished?: boolean;
  lessons?: Lesson[]; // Added lessons
  sections?: any[]; // MongoDB course sections
  recordedSessions?: LiveClass[]; // Added recorded sessions
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  id: string;
  _id?: string;
  courseId: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz';
  content: string;
  duration: number; // in minutes
  order: number;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  _id?: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  progress: number; // 0-100
  completedLessons: string[];
  enrolledAt: string;
  lastAccessedAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  submissions: Submission[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: string[];
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

export interface Discussion {
  id: string;
  courseId: string;
  title: string;
  content: string;
  authorId: string;
  author: User;
  replies: Reply[];
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: string;
  discussionId: string;
  authorId: string;
  author: User;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  courseId: string;
  studentId: string;
  student: User;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'enrollment' | 'assignment' | 'discussion' | 'payment' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
}

export interface LiveClass {
  id: string;
  _id?: string;
  title: string;
  instructorId: string;
  instructorName: string;
  module: string;
  status: 'online' | 'upcoming' | 'ended';
  scheduledFor: string;
  peers: number;
  duration?: string;
  roomID: string;
  courseId: string; // New field
  recordingUrl?: string; // New field
}

export interface AppState {
  user: User | null;
  theme: Theme;
  notifications: Notification[];
  isLoading: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  enrolledCourses: Course[];
  cart: string[];
  wishlist: string[];
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

export interface LiveClassState {
  liveClasses: LiveClass[];
  isLoading: boolean;
  error: string | null;
}

export type AuthenticatedPage<P = {}> = React.FC<P> & {
  allowedRoles?: ('student' | 'instructor' | 'admin')[];
  requireAuth?: boolean;
  noLayout?: boolean;
};
