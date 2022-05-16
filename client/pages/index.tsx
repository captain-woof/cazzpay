import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>CazzPay</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Link
          href={`https://www.sandbox.paypal.com/connect?flowEntry=static&client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=openid profile email&redirect_uri=http://redirectmeto.com/http://localhost:3000/dashboard`}
        >
          <button id="loginBtn">Login</button>
        </Link>
      </main>
    </div>
  );
};

export default Home;
