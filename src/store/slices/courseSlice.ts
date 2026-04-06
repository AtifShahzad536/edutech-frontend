import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Course, CourseState } from '@/types';
import axios from 'axios';

import API_URL from '@/config/api';

export const fetchCourses = createAsyncThunk('courses/fetchCourses', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/courses`);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
  }
});

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course');
    }
  }
);

export const fetchInstructorCourses = createAsyncThunk(
  'courses/fetchInstructorCourses',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/instructor/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch instructor courses');
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData: Partial<Course>, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/courses`, courseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create course');
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
    deleteCourse: (state, action: PayloadAction<string>) => {
      state.courses = state.courses.filter(c => c.id !== action.payload);
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
        state.courses = action.payload;
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
      });
  },
});

export const { clearError, setCurrentCourse, clearCurrentCourse, addToCart, toggleWishlist, addCourse, deleteCourse, updateCourse, enrollCourse, clearCart } = courseSlice.actions;
export default courseSlice.reducer;
