import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Course, CourseState } from '@/types';
import apiClient from '@/config/apiClient';

// Using apiClient centralized config

export const fetchCourses = createAsyncThunk('courses/fetchCourses', async (_, { rejectWithValue }) => {
  try {
    const response: any = await apiClient.get('/courses');
    // apiClient interceptor returns the full { success, data, meta } object
    // We extract just the courses array from response.data
    return Array.isArray(response.data) ? response.data : (response.data || response || []);
  } catch (error: any) {
    return rejectWithValue(error || 'Failed to fetch courses');
  }
});

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response: any = await apiClient.get(`/courses/${id}`);
      // Extract the single course object from the response wrapper
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error || 'Failed to fetch course');
    }
  }
);

export const fetchInstructorCourses = createAsyncThunk(
  'courses/fetchInstructorCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await apiClient.get('/instructor/courses');
      // Extract the courses array from the response wrapper
      return Array.isArray(response.data) ? response.data : (response.data || response || []);
    } catch (error: any) {
      return rejectWithValue(error || 'Failed to fetch instructor courses');
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData: Partial<Course>, { rejectWithValue }) => {
    try {
      const response: any = await apiClient.post('/courses', courseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error || 'Failed to create course');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/courses/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error || 'Failed to delete course');
    }
  }
);

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  enrolledCourses: [],
  cart: [],
  wishlist: [],
  isLoading: false,
  error: null,
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addCourse: (state, action: PayloadAction<Course>) => {
      state.courses.push(action.payload);
    },
    updateCourse: (state, action: PayloadAction<Course>) => {
      const stateIndex = state.courses.findIndex(c => c.id === action.payload.id);
      if (stateIndex !== -1) {
        state.courses[stateIndex] = { ...state.courses[stateIndex], ...action.payload };
      }
    },
    setCurrentCourse: (state, action: PayloadAction<Course>) => {
      state.currentCourse = action.payload;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    addToCart: (state, action: PayloadAction<string>) => {
      if (!state.cart.includes(action.payload)) {
        state.cart.push(action.payload);
      }
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const index = state.wishlist.indexOf(action.payload);
      if (index === -1) {
        state.wishlist.push(action.payload);
      } else {
        state.wishlist.splice(index, 1);
      }
    },
    enrollCourse: (state, action: PayloadAction<Course>) => {
      if (!state.enrolledCourses.some(c => c.id === action.payload.id)) {
        state.enrolledCourses.push(action.payload);
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure we always store an array, never an object
        state.courses = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch courses';
      })
      // Fetch course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch course';
      })
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses.push(action.payload);
        state.error = null;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to create course';
      })
      // Fetch instructor courses
      .addCase(fetchInstructorCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInstructorCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload;
        state.error = null;
      })
      .addCase(fetchInstructorCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ||'Failed to fetch instructor courses';
      })
      // Delete course
      .addCase(deleteCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = state.courses.filter(c => c.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to delete course';
      });
  },
});

export const { clearError, setCurrentCourse, clearCurrentCourse, addToCart, toggleWishlist, addCourse, updateCourse, enrollCourse, clearCart } = courseSlice.actions;
export default courseSlice.reducer;
