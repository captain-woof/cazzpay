import SellerDashboardPage from "../../components/pages/seller/dashboard";
import { GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import {
    generateAccessTokenForCustomer,
    getCustomerData,
} from "../../lib/paypal";

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const query: ParsedUrlQuery = context.query;

    if ("code" in query) {
        const authCode: string = query.code as string;
        const token: PayPalToken = await generateAccessTokenForCustomer(authCode);
        const userData: PaypalProfile = await getCustomerData(token.accessToken);

        return {
            props: {
                userData,
            },
        };
    } else {
        return {
            props: {
                userData: {
                    name: "",
                    email: "",
                    paypalId: ""
                }
            },
        };
    }
};

export default function SellerDashboard({ userData }: { userData: PaypalProfile }) {
    return (
        <SellerDashboardPage userData={userData} />
    )
}