import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import PayPage from "../../components/pages/pay";
import { UniswapPair } from "../../types/pair";

export const getStaticPaths: GetStaticPaths = async () => {

    // TODO: GET LIST OF ALL SELLERS
    const sellers = [{
        email: "sohail@email.com",
        name: "Sohail Saha",
        id: "RANDOM_ID"
    }]

    return {
        paths: sellers.map(({ id }) => ({
            params: {
                id
            }
        })),
        fallback: "blocking"
    };
}

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
    const id = params?.id;

    if (!!id) {
        // TODO: FETCH SELLER INFO USING ID
        const email = "sohail@email.com";
        const name = "Sohail Saha";

        // TODO: FETCH PAIR INFORMATION
        const pairs: Array<UniswapPair> = [{
            pairAddr: "0xC3c46F581A44989A02Eca7828467E369B90cb3fa",
            otherTokenAddr: "",
            otherTokenName: "Ether",
            otherTokenSymbol: "ETH"
        }, {
            pairAddr: "0xC3c46F581A44989A02Eca7828467E369B90cb3fa",
            otherTokenAddr: "0xC3c46F581A44989A02Eca7828467E369B90cb3fa",
            otherTokenName: "TestCoin",
            otherTokenSymbol: "TST"
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
    } else {
        return {
            notFound: true,
            revalidate: 1
        }
    }
}

export default function Pay({ id, email, name, pairs }: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <PayPage id={id} email={email} name={name} pairs={pairs} />
    )
}