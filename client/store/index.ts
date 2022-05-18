import { configureStore } from '@reduxjs/toolkit';
import paypal from './reducers/paypal';

export const store = configureStore({
    reducer: {
        paypal: paypal
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;