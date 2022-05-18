import { useCallback } from "react";
import { useSelector } from "react-redux"
import { RootState } from "../store"
import { paypalActions } from "../store/reducers/paypal";

export const usePaypal = () => {
    /**
     * @summary Stores all paypal state
     */
    const paypalState = useSelector((state: RootState) => state.paypal);

    /**
     * @summary Sets the paypal logged in state
     * @param newLoggedInState New logged in state to set (boolean)
     */
    const setPaypalLoggedInState = useCallback((newLoggedInState: boolean) => {
        paypalActions.setLoggedIn(newLoggedInState);
    }, []);

    /**
     * @summary Sets the paypal user's info, or null (for logged out state)
     * @param newUserInfo Paypal user's info OR null
     */
    const setPaypalUserInfo = useCallback((newUserInfo: typeof paypalState.userInfo) => {
        paypalActions.setUserInfo(newUserInfo);
    }, []);

    return {
        paypalState,
        setPaypalLoggedInState,
        setPaypalUserInfo
    }
}