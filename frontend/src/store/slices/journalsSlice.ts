import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Journal } from '@/types';

interface JournalsState {
  items: Journal[];
  loading: boolean;
  error: string | null;
}

const initialState: JournalsState = {
  items: [],
  loading: false,
  error: null,
};

const journalsSlice = createSlice({
  name: 'journals',
  initialState,
  reducers: {
    setJournals(state, action: PayloadAction<Journal[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setJournals, setLoading, setError } = journalsSlice.actions;
export default journalsSlice.reducer;