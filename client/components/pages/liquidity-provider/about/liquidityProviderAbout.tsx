import { Box, Button, Heading, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import Container from "../../../atoms/container";

export default function LiquidityProviderAboutPage() {
    return (
        <Container adjustForAppBar fullViewportHeight forReading padding={{ base: "4", md: "8" }}>

            <Heading fontSize="6xl" marginTop="2">
                How to earn as a liquidity provider?
            </Heading>

            <Text marginTop="4">
                Liquidity is defined as the assets you lend out for a period of time, to facilitate exchanges happening between buyers and sellers.
            </Text>

            <Text marginTop="4">
                Most platforms reward their liquidity providers for doing so, in form of additional assets at the time of withdrawing their liquidity.
            </Text>

            <Text marginTop="4">
                CazzPay does the same!
            </Text>

            <Box position="relative" marginTop="8" height="300px">
                <Image src="/images/liquidity-provider-about.jpg" alt="Person providing liquidity and earning rewards over time" layout="fill" width="3000px" height="2000px" objectFit="cover" />
            </Box>

            <Heading fontSize="4xl" marginTop="8">
                You provide liquidity to our ERC20 token pairs <i>(we use Uniswap V2)</i>, using which buyers and sellers interact on CazzPay, and you get your proportion of their transaction fees as an additional reward on withdrawing your liquidity!
            </Heading>

            <Text marginTop="4">
                You need to provide liquidity by pairing any ERC20 token with our CazzPayTokens <i>($CZP)</i>, which is our fiat-backed stablecoin pegged to USD in 1:1 ratio.
            </Text>

            <Heading fontSize="4xl" marginTop="14" textAlign="center">
                Get started today!
            </Heading>

            <Link href="/login?as=liquidity-provider"><a>
                <Button marginY="4" display="block" marginX="auto" size="lg" colorScheme="blue">
                    Join CazzPay
                </Button>
            </a></Link>
        </Container>
    )
}