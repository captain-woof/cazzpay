import { Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react"
import { usePaypal } from "../../../../hooks/usePaypal"
import Container from "../../../atoms/container";
import SellerQRCode from "./qrCode";
import TransactionsReceivedTable from "./transactionsReceivedTable";

interface ISellerDashboardPage {
    userData: PaypalProfile;
}

export default function SellerDashboardPage({ userData }: ISellerDashboardPage) {

    // For router
    const router = useRouter();

    // For paypal auth info
    const { paypalState, setPaypalUserInfo, setPaypalLoggedInState } = usePaypal();

    // To set Paypal auth information
    useEffect(() => {
        if (userData?.email?.length !== 0) {
            setPaypalLoggedInState(true);
            setPaypalUserInfo({
                email: userData.email,
                name: userData.name,
                id: userData.paypalId
            });
        } else if (!paypalState.loggedIn) {
            router.push("/");
        }
        // TODO: Fire event on smart contract
    }, [userData, router]);

    return (
        <Container fullViewportHeight adjustForAppBar padding={{ base: "4", md: "8" }}>

            {/* Heading */}
            <Heading fontSize="6xl">
                Seller dashboard
            </Heading>
            <Heading fontSize="2xl">For {paypalState?.userInfo?.name}</Heading>

            {/* QRCode section */}
            <SellerQRCode buttonProps={{ marginTop: 4 }} />

            {/* Transactions received table */}
            <TransactionsReceivedTable />
        </Container>
    )
}