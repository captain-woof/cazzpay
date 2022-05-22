import { configureStore } from '@reduxjs/toolkit';
import paypal from './reducers/paypal';
import walletConnectionReducer from './reducers/connection';

export const store = configureStore({
    reducer: {
        paypal: paypal,
        walletConnection: walletConnectionReducer
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;