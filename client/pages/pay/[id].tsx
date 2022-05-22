import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import PayPage from "../../components/pages/pay";
import { getAllPairsWithCzpAndOtherToken } from "../../lib/ethers";
import { getSellerDetails, listOfSellers } from "../../lib/graphql";

export const getStaticPaths: GetStaticPaths = async () => {

    const sellers = await listOfSellers();

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
        // FETCH SELLER INFO USING ID
        const { email, name } = await getSellerDetails(id as string);

        // FETCH PAIR INFORMATION
        const pairs = await getAllPairsWithCzpAndOtherToken();

        return {
            props: {
                id,
                email,
                name,
                pairs
            },
            revalidate: 10 * 60
        }
    } else {
        return {
            notFound: true,
            revalidate: 10
        }
    }
}

export default function Pay({ id, email, name, pairs }: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <PayPage id={id} email={email} name={name} pairs={pairs} />
    )
}