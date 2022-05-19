import { Heading, Text } from "@chakra-ui/react";
import { useEffect } from "react"
import { usePaypal } from "../../../../hooks/usePaypal"
import Container from "../../../atoms/container";
import SellerQRCode from "./qrCode";
import TransactionsReceivedTable from "./transactionsReceivedTable";

export default function SellerDashboardPage() {

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

        // TODO: Fire event on smart contract
    }, []);

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