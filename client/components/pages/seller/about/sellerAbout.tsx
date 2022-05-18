import { Box, Button, Heading, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import Container from "../../../atoms/container";

export default function SellerAboutPage() {
    return (
        <Container adjustForAppBar fullViewportHeight forReading padding={{ base: "4", md: "8" }}>

            <Heading fontSize="6xl" marginTop="2">
                What does CazzPay do?
            </Heading>

            <Text marginTop="4">
                With the Web3 industry ever expanding, more and more people are drawn to using cryptocurrencies for their ever-expanding uses.
            </Text>

            <Text marginTop="4">
                You might find that very soon, your customer would prefer to pay you with the same. But what if, you just want to be paid in fiat?
            </Text>

            <Text marginTop="4">
                Enters CazzPay!
            </Text>

            <Box position="relative" marginTop="8" height="200px">
                <Image src="/images/seller-about.jpg" alt="Items displayed for sell" layout="fill" width="3000px" height="2000px" objectFit="cover" />
            </Box>

            <Heading fontSize="4xl" marginTop="8">
                With CazzPay, your customers pay you in crypto, but you get that deposited as fiat straight to your bank instantly!
            </Heading>

            <Text marginTop="4">
                We handle the magic in between, giving both you and your customers a seamless selling experience.
            </Text>

            <Heading fontSize="4xl" marginTop="14" textAlign="center">
                Sounds like something you want?
            </Heading>

            <Link href="/login?as=seller"><a>
                <Button marginY="4" display="block" marginX="auto" size="lg" colorScheme="blue">
                    Join CazzPay
                </Button>
            </a></Link>
        </Container>
    )
}