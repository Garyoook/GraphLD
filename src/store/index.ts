import databaseReducer from '@/pages/reducer/databaseReducer';
import { configureStore } from '@reduxjs/toolkit';

export default configureStore({
  reducer: {
    database: databaseReducer,
  },
});
