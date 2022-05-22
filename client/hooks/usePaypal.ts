import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../store"
import { paypalActions } from "../store/reducers/paypal";

export const usePaypal = () => {
    /**
     * @summary Stores all paypal state
     */
    const paypalState = useSelector((state: RootState) => state.paypal);

    /**
     * @summary For dispatching
     */
    const dispatch = useDispatch();

    /**
     * @summary Sets the paypal logged in state
     * @param newLoggedInState New logged in state to set (boolean)
     */
    const setPaypalLoggedInState = useCallback((newLoggedInState: boolean) => {
        dispatch(paypalActions.setLoggedIn(newLoggedInState));
    }, [dispatch]);

    /**
     * @summary Sets the paypal user's info, or null (for logged out state)
     * @param newUserInfo Paypal user's info OR null
     */
    const setPaypalUserInfo = useCallback((newUserInfo: typeof paypalState.userInfo) => {
        dispatch(paypalActions.setUserInfo(newUserInfo));
    }, [dispatch]);

    return {
        paypalState,
        setPaypalLoggedInState,
        setPaypalUserInfo
    }
}