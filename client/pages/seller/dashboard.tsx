import SellerDashboardPage from "../../components/pages/seller/dashboard";
import { GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import {
    generateAccessTokenForCustomer,
    getCustomerData,
} from "../../lib/paypal";

const emptyProps = {
    props: {
        userData: {
            name: "",
            email: "",
            paypalId: ""
        }
    }
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const query: ParsedUrlQuery = context.query;

    if ("code" in query) {
        try {
            const authCode: string = query.code as string;
            const token: PayPalToken = await generateAccessTokenForCustomer(authCode);
            const userData: PaypalProfile = await getCustomerData(token.accessToken);

            return {
                props: {
                    userData,
                },
            };
        } catch {
            return emptyProps;
        }
    } else {
        return emptyProps;
    }
};

export default function SellerDashboard({ userData }: { userData: PaypalProfile }) {
    return (
        <SellerDashboardPage userData={userData} />
    )
}