import { InferGetStaticPropsType } from "next";
import LiquidityProviderDashboardPage from "../../components/pages/liquidity-provider/dashboard";
import { UniswapPair } from "../../types/pair";

export const getStaticProps = async () => {

    // TODO: FETCH LP PAYPAL INFO
    const id = "RANDOM_ID"
    const email = "sohail@email.com";
    const name = "Sohail Saha";

    // TODO: FETCH PAIR INFORMATION
    const pairs: Array<UniswapPair> = [{
        pairAddr: "0xC3c46F581A44989A02Eca7828467E369B90cb3fa",
        otherTokenAddr: "",
        otherTokenName: "Ether",
        otherTokenSymbol: "ETH",
        otherTokenDecimals: 18
    }, {
        pairAddr: "0xC3c46F581A44989A02Eca7828467E369B90cb3fa",
        otherTokenAddr: "0xC3c46F581A44989A02Eca7828467E369B90cb3fa",
        otherTokenName: "TestCoin",
        otherTokenSymbol: "TST",
        otherTokenDecimals: 18
    }];

    return {
        props: {
            id,
            email,
            name,
            pairs
        },
        revalidate: 1
    }
}

export default function LiquidityProviderDashboard({ email, id, name, pairs }: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <LiquidityProviderDashboardPage email={email} id={id} name={name} pairs={pairs} />
    )
}