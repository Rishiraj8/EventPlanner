import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchEventById = createAsyncThunk(
  'event/fetchEventById',
  async (eventId, thunkAPI) => {
    try {
      const { data } = await axios.get(`/api/events/${eventId}`);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Something went wrong');
    }
  }
);

const eventSlice = createSlice({
  name: 'event',
  initialState: {
    event: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearEvent: (state) => {
      state.event = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.event = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEvent } = eventSlice.actions;
export default eventSlice.reducer;
