import { Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react"
import { useCazzPay } from "../../../../hooks/useCazzPay";
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

    // For CazzPay
    const { storeSellerInfo } = useCazzPay();

    // To set Paypal auth information
    useEffect(() => {
        (async () => {
            if (userData?.email?.length !== 0) {
                setPaypalLoggedInState(true);
                setPaypalUserInfo({
                    email: userData.email,
                    name: userData.name,
                    id: userData.paypalId
                });
                await storeSellerInfo(userData.name, userData.email, userData.paypalId);
            } else if (!paypalState.loggedIn) {
                router.push("/login?as=seller");
            }
        })();
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