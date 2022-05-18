import { Button, Flex, Heading, Image, useColorModeValue, useBreakpointValue } from "@chakra-ui/react";
import Link from "next/link";
import Container from "../../atoms/container";

export default function HomePage() {

    // Landing page image source
    const landingPageImageSource = useColorModeValue("/images/landing-page-light.svg", "/images/landing-page-dark.svg");

    // CTA button size
    const ctaButtonSize = useBreakpointValue({ base: "md", md: "lg" });

    return (
        <Container height="100vh">
            <Flex flexDirection="column" justifyContent="center" alignItems="center" width="full" height="full" padding="8" position="relative">

                {/* Background image */}
                <Image src={landingPageImageSource} alt="CazzPay allowing customer to pay in crypto and seller to receive in fiat" marginY="auto" position="absolute" bottom="0" left="0" width="full" zIndex={1} opacity={{ base: "1", sm: "0.4" }} />

                {/* Title */}
                <Heading fontSize={{ base: "6xl", md: "8xl" }} textAlign="center" zIndex={2}>CazzPay</Heading>

                {/* Description */}
                <Heading fontSize={{ base: "xl", md: "2xl" }} textAlign="center" zIndex={2}>Accept crypto payments straight as fiat!</Heading>

                {/* CTAs */}
                <Flex gap="2" marginTop="4" justifyContent="center" alignItems="center" zIndex={2}>
                    <Link href="/liquidity-provider/about" passHref><a><Button size={ctaButtonSize}>
                        Earn from liquidity
                    </Button></a></Link>
                    <Link href="/seller/about" passHref><a><Button colorScheme="blue" size={ctaButtonSize}>
                        Know more
                    </Button></a></Link>
                </Flex>

            </Flex>
        </Container >
    )
}