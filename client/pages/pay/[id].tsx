import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import PayPage from "../../components/pages/pay";

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
    let email, name;

    if (!!id) {
        // TODO: FETCH SELLER INFO USING ID
        email = "sohail@email.com";
        name = "Sohail Saha";

        return {
            props: {
                id,
                email,
                name
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

export default function Pay({ id, email, name }: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <PayPage id={id} email={email} name={name} />
    )
}