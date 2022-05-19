import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WalletsSupported } from "../../types/wallet";

export type ConnectionState = {
    isConnecting: boolean;
    showConnectionDialog: boolean;
    walletPreConnected: WalletsSupported | null | "";
}

const initialState: ConnectionState = {
    isConnecting: false,
    showConnectionDialog: false,
    walletPreConnected: null
}

const connectionStateSlice = createSlice({
    name: "walletConnection",
    initialState,
    reducers: {
        setIsConnecting: (state, action: PayloadAction<boolean>) => {
            state.isConnecting = action.payload;
        },
        setShowConnectionModal: (state, action: PayloadAction<boolean>) => {
            state.showConnectionDialog = action.payload;
        },
        setWalletPreConnected: (state, action: PayloadAction<WalletsSupported | null | "">) => {
            state.walletPreConnected = action.payload;
        }
    }
});

export const actionGenerators = connectionStateSlice.actions;
const walletConnectionReducer = connectionStateSlice.reducer;
export default walletConnectionReducer;
