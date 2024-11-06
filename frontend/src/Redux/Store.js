import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import persistReducer from 'redux-persist/es/persistReducer';
import leaveRequestsSlice from './leaveRequestsSlice';
import { setupListeners } from '@reduxjs/toolkit/query';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
};

const rootReducer = combineReducers({
  leaveRequestData: leaveRequestsSlice,
});

const persisredReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persisredReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

setupListeners(store.dispatch);