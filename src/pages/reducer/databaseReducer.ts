import { createSlice } from '@reduxjs/toolkit';

export interface DatabaseState {
  database: {
    repo: string;
    db_prefix_URL: string;
  };
}

export const databaseSlice = createSlice({
  name: 'database',
  initialState: {
    repo: undefined,
    db_prefix_URL: 'http://www.semwebtech.org/mondial/10/meta#',
  },
  reducers: {
    setRepo: (state, action) => {
      state.repo = action.payload;
    },
    setPrefixURL: (state, action) => {
      state.db_prefix_URL = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setRepo, setPrefixURL } = databaseSlice.actions;

export default databaseSlice.reducer;
