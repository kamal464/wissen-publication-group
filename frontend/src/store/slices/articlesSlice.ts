import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ArticleSummary = {
  id: string;
  title: string;
  summary?: string;
  publishedAt?: string;
};

export type ArticlesState = {
  items: ArticleSummary[];
  isLoading: boolean;
};

const initialState: ArticlesState = {
  items: [],
  isLoading: false,
};

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    setArticles(state, action: PayloadAction<ArticleSummary[]>) {
      state.items = action.payload;
    },
    setArticlesLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    clearArticles(state) {
      state.items = [];
      state.isLoading = false;
    },
  },
});

export const { setArticles, setArticlesLoading, clearArticles } = articlesSlice.actions;
export default articlesSlice.reducer;
