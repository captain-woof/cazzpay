import { Box, Grid, Heading, Text, Tooltip } from "@chakra-ui/react";
import { useEffect } from "react";
import { usePaypal } from "../../../../hooks/usePaypal";
import { UniswapPair } from "../../../../types/pair";
import Container from "../../../atoms/container";
import BuyCzp from "./buyCzp";
import { MdOutlineSwapVert as SwapIcon } from "react-icons/md";
import { useLiquidityProvider } from "../../../../hooks/useLiquidityProvider";
import PairDialog from "./pairDialog";

interface ILiquidityProviderDashboard {
    email: string;
    id: string;
    name: string;
    pairs: Array<UniswapPair>;
}

export default function LiquidityProviderDashboardPage({ email, id, name, pairs }: ILiquidityProviderDashboard) {

    // For paypal auth info
    const { paypalState, setPaypalUserInfo, setPaypalLoggedInState } = usePaypal();

    // For liquidity provider funcs
    const { setPairSelected, pairSelected, pairDialogVisible, pairInfo, pairInfoProgress, liquidityToWithdraw, setLiquidityToWithdraw, minCzpToWithdraw, minOtherTokenToWithdraw, setMinCzpToWithdraw, setMinOtherTokenToWithdraw, handleWithdrawLiquidity, liquidityWithdrawProgress } = useLiquidityProvider();

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

            {/* List of pairs */}
            <Heading marginTop={12}>Pairs with $CZP</Heading>
            <Grid marginTop={4} templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(auto-fit, minmax(12rem, 1rem))" }} gap="4">
                {pairs.map((pair, index) => (
                    <Tooltip key={index} label="Liquidity for this pair">
                        <Box as="button" borderWidth={pairSelected?.otherTokenSymbol === pair.otherTokenSymbol ? "2px" : "1px"} borderColor="blue.400" cursor="pointer" aria-label={`Liquidity for ${pair.otherTokenSymbol}-CZP pair`} display="flex" alignItems="center" padding="4" flexDirection="column" borderRadius="md" boxShadow="md" _hover={{ boxShadow: "xl" }} _active={{ boxShadow: "2xl" }} onClick={() => { setPairSelected(pair); }}>
                            <Text fontSize="lg" marginBottom={2}>${pair.otherTokenSymbol}</Text>
                            <SwapIcon size={20} />
                            <Text fontSize="lg" marginTop={2}>$CZP</Text>
                        </Box>
                    </Tooltip>
                ))}
            </Grid>

            {/* Pair Dialog */}
            <PairDialog pairDialogVisible={pairDialogVisible} pairSelected={pairSelected} setPairSelected={setPairSelected} pairInfo={pairInfo} pairInfoProgress={pairInfoProgress} liquidityToWithdraw={liquidityToWithdraw} setLiquidityToWithdraw={setLiquidityToWithdraw} minCzpToWithdraw={minCzpToWithdraw} minOtherTokenToWithdraw={minOtherTokenToWithdraw} setMinCzpToWithdraw={setMinCzpToWithdraw} setMinOtherTokenToWithdraw={setMinOtherTokenToWithdraw} handleWithdrawLiquidity={handleWithdrawLiquidity} liquidityWithdrawProgress={liquidityWithdrawProgress} />

        </Container>
    )
}