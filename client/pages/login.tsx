import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import LoginPage from "../components/pages/login";

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
    let loginAs = (query?.as === "liquidity-provider" ? "liquidity-provider" : "seller") as "seller" | "liquidity-provider";

    return {
        props: {
            loginAs
        }
    }
}

export default function Login({ loginAs }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <LoginPage loginAs={loginAs} />
    )
}