import { Box, Button, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useCallback } from "react";
import { usePaypal } from "../../../hooks/usePaypal";
import Container from "../../atoms/container";
import { useRouter } from "next/router";

interface ILoginPage {
    loginAs: "seller" | "liquidity-provider";
}

export default function LoginPage({ loginAs }: ILoginPage) {

    // For auth state
    const { paypalState, setPaypalLoggedInState } = usePaypal();

    // Function to handle login
    const handleLogin = useCallback(() => {
        window?.alert("TODO: LOGIN");
    }, [setPaypalLoggedInState]);

    // Next router
    const router = useRouter();

    // Handle navigation to dashboard
    const handleNavToDashboard = useCallback(async () => {
        await router.push(`${loginAs}/dashboard`);
    }, [loginAs, router])

    return (
        <Container adjustForAppBar fullViewportHeight forReading display="flex" justifyContent="center" alignItems="center">
            <Box width="full" padding={{ base: "4", md: "8" }} borderRadius="md" boxShadow="md">

                <Heading fontSize="5xl">Login</Heading>

                {!paypalState.loggedIn ?
                    <Text marginTop="4">
                        {loginAs === "seller" ?
                            <>
                                You need to login with Paypal to be able to <Link passHref href="/seller/about"><a>receive fiat payments straight to your account</a></Link>.
                            </> :

                            <>
                                You need to login with Paypal to directly buy $CZP, needed to <Link passHref href="/liquidity-provider/about"><a>provide liquidity to our token pairs</a></Link>.
                            </>
                        }
                    </Text> :
                    <Text marginTop="4">
                        You're already logged in!
                    </Text>
                }

                <Button onClick={!paypalState.loggedIn ? handleLogin : handleNavToDashboard} display="block" marginLeft="auto" marginTop="4" colorScheme="blue">
                    {!paypalState.loggedIn ? "Login with PayPal" : "Go to dashboard"}
                </Button>

            </Box>
        </Container>
    )
}