import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { ParsedUrlQuery } from "querystring";
import LiquidityProviderDashboardPage from "../../components/pages/liquidity-provider/dashboard";
import { getAllPairsWithCzpAndOtherToken } from "../../lib/ethers";
import { generateAccessTokenForCustomer, getCustomerData } from "../../lib/paypal";

const emptyProps = {
    props: {
        userData: {
            name: "",
            email: "",
            paypalId: ""
        },
        pairs: []
    }
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const query: ParsedUrlQuery = context.query;

    if ("code" in query) {
        try {
            // Get Paypal user id
            const authCode: string = query.code as string;
            const token: PayPalToken = await generateAccessTokenForCustomer(authCode);
            const userData: PaypalProfile = await getCustomerData(token.accessToken);

            // Fetch all pairs to show
            const pairs = await getAllPairsWithCzpAndOtherToken();

            return {
                props: {
                    userData,
                    pairs
                },
            };
        } catch {
            return emptyProps;
        }
    } else {
        return emptyProps;
    }
};

export default function LiquidityProviderDashboard({ userData, pairs }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <LiquidityProviderDashboardPage email={userData?.email} id={userData?.paypalId} name={userData?.name} pairs={pairs || []} />
    )
}