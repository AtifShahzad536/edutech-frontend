import { configureStore } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import uiReducer from './slices/uiSlice';
import liveReducer from './slices/liveSlice';
import assignmentReducer from './slices/assignmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    ui: uiReducer,
    live: liveReducer,
    assignments: assignmentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Memoized selectors
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

export const selectCourses = (state: RootState) => state.courses.courses;
export const selectCurrentCourse = (state: RootState) => state.courses.currentCourse;
export const selectEnrolledCourses = (state: RootState) => state.auth.user?.enrolledCourses || state.courses.enrolledCourses;
export const selectCoursesLoading = (state: RootState) => state.courses.isLoading;
export const selectCoursesError = (state: RootState) => state.courses.error;

export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectNotifications = (state: RootState) => state.ui.notifications;

export const selectLiveClasses = (state: RootState) => state.live.liveClasses;
export const selectLiveClassById = (state: RootState, id: string) => state.live.liveClasses.find(lc => lc.id === id);

export const selectAssignments = (state: RootState) => state.assignments.assignments;
export const selectAssignmentById = (state: RootState, id: string) => state.assignments.assignments.find(a => a.id === id);

export const selectEnrolledLiveClasses = createSelector(
  [selectLiveClasses, selectEnrolledCourses],
  (liveClasses, enrolledCourses) => {
    if (!enrolledCourses) return liveClasses.filter(lc => lc.status === 'online');
    
    const enrolledCourseIds = enrolledCourses.map(c => {
      if (typeof c === 'string') return c;
      return c?._id || c?.id;
    }).filter(Boolean);
    
    return liveClasses.filter(lc => {
      // Show if it's currently LIVE (Discovery) OR if user is enrolled in that specific course
      if (lc.status === 'online') return true;
      
      const courseIdStr = lc.courseId?.toString();
      return enrolledCourseIds.some(id => id?.toString() === courseIdStr);
    });
  }
);

// Complex memoized selectors
export const selectAuthUserFullName = createSelector(
  [selectAuthUser],
  (user) => user ? `${user.firstName} ${user.lastName}` : ''
);

export const selectCoursesByCategory = createSelector(
  [selectCourses, (state: RootState, category: string) => category],
  (courses, category) => courses.filter(course => 
    category === 'all' || course.category.toLowerCase() === category.toLowerCase()
  )
);

export const selectPublishedCourses = createSelector(
  [selectCourses],
  (courses) => courses.filter(course => course.isPublished)
);

export const selectCoursesByInstructor = createSelector(
  [selectCourses, (state: RootState, instructorId: string) => instructorId],
  (courses, instructorId) => courses.filter(course => course.instructorId === instructorId)
);

export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter(notification => !notification.isRead)
);

export const selectUnreadNotificationsCount = createSelector(
  [selectUnreadNotifications],
  (unreadNotifications) => unreadNotifications.length
);

export const selectCoursesStats = createSelector(
  [selectCourses],
  (courses) => ({
    total: courses.length,
    published: courses.filter(course => course.isPublished).length,
    draft: courses.filter(course => !course.isPublished).length,
    totalStudents: courses.reduce((sum, course) => sum + course.studentsCount, 0),
    averageRating: courses.length > 0 
      ? courses.reduce((sum, course) => sum + course.rating, 0) / courses.length 
      : 0,
  })
);

export const selectUserStats = createSelector(
  [selectAuthUser, selectEnrolledCourses],
  (user, enrolledCourses) => ({
    user,
    enrolledCoursesCount: enrolledCourses.length,
    hasEnrollments: enrolledCourses.length > 0,
  })
);
