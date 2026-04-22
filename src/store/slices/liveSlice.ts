import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LiveClass, LiveClassState } from '@/types';
import apiClient from '@/config/apiClient';

export const fetchLiveClasses = createAsyncThunk(
  'live/fetchLiveClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await apiClient.get('/live');
      if (response.success) {
        return response.data.map((lc: any) => ({
          id: lc._id || lc.id,
          title: lc.title,
          instructorId: lc.instructor?._id,
          instructorName: `${lc.instructor?.firstName} ${lc.instructor?.lastName}`,
          status: lc.status === 'live' || lc.status === 'online' ? 'online' : lc.status,
          scheduledFor: new Date(lc.scheduledFor).toLocaleString(),
          peers: lc.peers || 0,
          module: lc.module,
          duration: lc.duration,
          roomID: lc.roomId || lc.roomID,
          courseId: lc.course?._id || lc.course?.id || lc.course,
        }));
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error || 'Failed to fetch live classes');
    }
  }
);

export const startLiveClass = createAsyncThunk(
  'live/startLiveClass',
  async (data: { courseId: string; title: string, description?: string }, { rejectWithValue }) => {
    try {
      const response: any = await apiClient.post('/live/start', data);
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error || 'Failed to start live class');
    }
  }
);

export const endLiveClass = createAsyncThunk(
  'live/endLiveClass',
  async (data: { id: string; recordingUrl?: string }, { rejectWithValue }) => {
    try {
      const response: any = await apiClient.post(`/live/${data.id}/end`, { recordingUrl: data.recordingUrl });
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error || 'Failed to end live class');
    }
  }
);

export const updateLiveClassStatus = createAsyncThunk(
  'live/updateLiveClassStatus',
  async (data: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response: any = await apiClient.patch(`/live/${data.id}/status`, { status: data.status });
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error || 'Failed to update status');
    }
  }
);

export const scheduleLiveClass = createAsyncThunk(
  'live/scheduleLiveClass',
  async (data: { courseId: string; title: string; module: string; scheduledFor: string }, { rejectWithValue }) => {
    try {
      const response: any = await apiClient.post('/live/schedule', data);
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error || 'Failed to schedule live class');
    }
  }
);

const initialState: LiveClassState = {
  liveClasses: [],
  isLoading: false,
  error: null,
};

const liveSlice = createSlice({
  name: 'live',
  initialState,
  reducers: {
    removeLiveClass: (state, action: PayloadAction<string>) => {
      state.liveClasses = state.liveClasses.filter((lc) => lc.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveClasses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLiveClasses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.liveClasses = action.payload;
      })
      .addCase(fetchLiveClasses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(startLiveClass.fulfilled, (state, action) => {
        const lc = action.payload;
        state.liveClasses.unshift({
          id: lc._id,
          title: lc.title,
          instructorId: lc.instructor?._id || lc.instructor,
          instructorName: lc.instructor?.firstName ? `${lc.instructor.firstName} ${lc.instructor.lastName}` : 'You',
          status: lc.status,
          scheduledFor: new Date(lc.scheduledFor).toLocaleString(),
          peers: 0,
          module: lc.module,
          duration: lc.duration || '00:00',
          roomID: lc.roomId || lc.roomID,
          courseId: lc.course?._id || lc.course,
        });
      })
      .addCase(endLiveClass.fulfilled, (state, action) => {
        const index = state.liveClasses.findIndex(lc => lc.id === action.payload._id);
        if (index !== -1) {
          state.liveClasses[index].status = 'ended';
        }
      })
      .addCase(updateLiveClassStatus.fulfilled, (state, action) => {
        const index = state.liveClasses.findIndex(lc => lc.id === action.payload._id);
        if (index !== -1) {
          state.liveClasses[index].status = action.payload.status;
        }
      })
      .addCase(scheduleLiveClass.fulfilled, (state, action) => {
        const lc = action.payload;
        state.liveClasses.push({
          id: lc._id,
          title: lc.title,
          instructorId: lc.instructor?._id || lc.instructor,
          instructorName: lc.instructor?.firstName ? `${lc.instructor.firstName} ${lc.instructor.lastName}` : 'You',
          status: lc.status,
          scheduledFor: new Date(lc.scheduledFor).toLocaleString(),
          peers: 0,
          module: lc.module,
          duration: lc.duration || '00:00',
          roomID: lc.roomId || lc.roomID,
          courseId: lc.course?._id || lc.course,
        });
      });
  },
});

export const { removeLiveClass } = liveSlice.actions;
export default liveSlice.reducer;
