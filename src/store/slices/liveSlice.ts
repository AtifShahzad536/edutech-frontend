import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LiveClass, LiveClassState } from '@/types';
import API_URL from '@/config/api';

export const fetchLiveClasses = createAsyncThunk(
  'live/fetchLiveClasses',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/live`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        return result.data.map((lc: any) => ({
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
      return rejectWithValue(result.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const startLiveClass = createAsyncThunk(
  'live/startLiveClass',
  async (data: { courseId: string; title: string, description?: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/live/start`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) return result.data;
      return rejectWithValue(result.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const endLiveClass = createAsyncThunk(
  'live/endLiveClass',
  async (data: { id: string; recordingUrl?: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/live/${data.id}/end`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recordingUrl: data.recordingUrl })
      });
      const result = await response.json();
      if (result.success) return result.data;
      return rejectWithValue(result.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLiveClassStatus = createAsyncThunk(
  'live/updateLiveClassStatus',
  async (data: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log(`[LiveSync] Updating session ${data.id} to status: ${data.status}`);
      const response = await fetch(`${API_URL}/live/${data.id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: data.status })
      });
      const result = await response.json();
      if (result.success) {
        console.log(`[LiveSync] Successfully updated status on server for ${data.id}`);
        return result.data;
      }
      console.error(`[LiveSync] Server returned error for ${data.id}: ${result.message}`);
      return rejectWithValue(result.message);
    } catch (error: any) {
      console.error(`[LiveSync] Network error updating status for ${data.id}: ${error.message}`);
      return rejectWithValue(error.message);
    }
  }
);

export const scheduleLiveClass = createAsyncThunk(
  'live/scheduleLiveClass',
  async (data: { courseId: string; title: string; module: string; scheduledFor: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/live/schedule`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) return result.data;
      return rejectWithValue(result.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
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
