import { Heading } from "@chakra-ui/react";
import { useEffect } from "react";
import { usePaypal } from "../../../../hooks/usePaypal";
import { UniswapPair } from "../../../../types/pair";
import Container from "../../../atoms/container";
import BuyCzp from "./buyCzp";

interface ILiquidityProviderDashboard {
    email: string;
    id: string;
    name: string;
    pairs: Array<UniswapPair>;
}

export default function LiquidityProviderDashboardPage({ email, id, name, pairs }: ILiquidityProviderDashboard) {

    // For paypal auth info
    const { paypalState, setPaypalUserInfo, setPaypalLoggedInState } = usePaypal();

    // To set Paypal auth information
    useEffect(() => {
        // TODO: Get and set paypal auth info
        setPaypalLoggedInState(true);
        setPaypalUserInfo({
            email: "sohail@email.com",
            name: "Sohail Saha",
            id: "RANDOM_ID"
        });
    }, []);

    return (
        <Container fullViewportHeight adjustForAppBar padding={{ base: "4", md: "8" }}>

            {/* Heading */}
            <Heading fontSize="6xl">
                Liquidity Provider dashboard
            </Heading>
            <Heading fontSize="2xl">For {paypalState?.userInfo?.name}</Heading>

            {/* Buying CZP section */}
            <BuyCzp buttonProps={{ marginTop: 4 }} />

        </Container>
    )
}