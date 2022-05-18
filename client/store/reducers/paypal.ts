import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PaypalState = {
    loggedIn: boolean;
    userInfo: null | {
        id: string;
        name: string;
        email: string;
    }
}

const initialState: PaypalState = {
    loggedIn: false,
    userInfo: null
}

const paypalSlice = createSlice({
    name: "paypal",
    initialState,
    reducers: {
        setLoggedIn: (state, action: PayloadAction<boolean>) => {
            state.loggedIn = action.payload;
        },
        setUserInfo: (state, action: PayloadAction<typeof initialState.userInfo>) => {
            state.userInfo = action.payload;
        }
    } 
});

export const paypalActions = paypalSlice.actions;
export default paypalSlice.reducer;