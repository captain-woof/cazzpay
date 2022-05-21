import { ethers } from "ethers";
import { CazzPay, CazzPayToken, ERC20 } from "../typechain";
import CazzPayArtifact from "../contracts/CazzPay.json";
import { getChainsBasedOnEnv } from "../hooks/useWalletConnection/chains";
import { UniswapPair, UniswapV2PairContract } from "../types/pair";
import UniswapPairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";
import ERC20Artifact from "@uniswap/v2-core/build/ERC20.json";
import { getSellerDetails, getTransactionById } from "./graphql";

// CAZZPAY WALLET (OWNER) AND CONTRACTS
const chains = getChainsBasedOnEnv();
const chainId = Object.keys(chains)[0];
const cazzPayProvider = new ethers.providers.JsonRpcProvider(chains[chainId]?.urls[0] as string);
const cazzPaySigner = new ethers.Wallet(process.env.CAZZPAY_SIGNER_PRIVATE_KEY as string, cazzPayProvider);
const cazzPayContract = (new ethers.Contract(process.env.NEXT_PUBLIC_CAZZPAY_CONTRACT_ADDR as string, CazzPayArtifact.abi, cazzPayProvider)).connect(cazzPaySigner) as CazzPay;

/////////////////////////////
// EXPORTED FUNCS
/////////////////////////////

/**
 * @summary Gets all pairs with CZP
 * @returns List of all pairs with CZP
 */
export const getAllPairsWithCzpAndOtherToken = async (
) => {
  if (!!cazzPayContract) {
    const pairAddrs = await cazzPayContract.getAllPairsWithCzpAndOtherToken();
    const pairs: Array<UniswapPair> = [];

    // Find all pair details
    for await (let pairAddr of pairAddrs) {
      const pairContract = new ethers.Contract(pairAddr, UniswapPairArtifact.abi, cazzPayProvider) as UniswapV2PairContract;

      // Get other token address
      const [token0Addr, token1Addr] = await Promise.all([
        pairContract.token0(),
        pairContract.token1()
      ]);
      let otherTokenAddr;
      if (token0Addr.toLowerCase() === process.env.NEXT_PUBLIC_CZP_CONTRACT_ADDR) {
        otherTokenAddr = token0Addr;
      } else {
        otherTokenAddr = token1Addr;
      }

      // Get other token details
      const otherTokenContract = new ethers.Contract(otherTokenAddr, ERC20Artifact.abi, cazzPayProvider) as ERC20;
      const [otherTokenName, otherTokenSymbol, otherTokenDecimals] = await Promise.all([
        otherTokenContract.name(),
        otherTokenContract.symbol(),
        otherTokenContract.decimals()
      ]);

      // Store results
      pairs.push({
        pairAddr,
        otherTokenAddr,
        otherTokenName,
        otherTokenSymbol,
        otherTokenDecimals
      });
    }

    return pairs;
  }
};

/**
 * @summary Stores a seller info, by invoking appropriate function on CazzPay contract
 * @dev Must be called ONLY from backend, because this functionality is protected
 * @param sellerIdToStore Id of the seller to store
 * @param sellerEmail Email of the seller to store
 * @param sellerName Name of the seller to store
 */
export const storeSellerInfo = async (sellerIdToStore: string, sellerEmail: string, sellerName: string) => {

  // Check if a seller exists with same info
  const seller = await getSellerDetails(sellerIdToStore);
  if (!!seller && seller.email === sellerEmail && seller.name === sellerName) {
    throw Error("Seller already exists with same info!");
  }

  // Store info
  const tx = await cazzPayContract.storeSellerInfo(
    sellerIdToStore,
    sellerEmail,
    sellerName
  );
  await tx.wait();
}

/**
 * @summary Sets a transaction as confirmed
 * @dev Must be called ONLY from backend, because this functionality is protected
 * @param cazzPayTransactionId CazzPay transaction id of the transaction to set as confirmed
 */
export const setPurchaseConfirmation = async (cazzPayTransactionId: string) => {

  const transaction = await getTransactionById(cazzPayTransactionId);

  // Proceed only if transaction is unconfirmed
  if (!!transaction && transaction.confirmed === false && "fiatAmountToPayToSeller" in transaction) {

    try {
      const sellerToPay = transaction.recipientSeller;
      const amtToPayToSeller = ethers.utils.formatUnits(transaction.fiatAmountToPayToSeller?.toString() as string, 16);
      // TODO (Rajarshi): PAY TO SELLER WITH THE AMOUNT FOUND ABOVE

      // Confirm payment on contract only if the above operation succeeds
      const tx = await cazzPayContract.setPurchaseConfirmation(cazzPayTransactionId);
      await tx.wait();
    } catch (e: any) {
      throw Error(e?.message || "Purchase could not be verified!");
    }
  }
}

/**
 * @param tokenContractAddr Address of the token contract
 * @return name, symbol, decimals
 */
export const getTokenDetails = async (tokenContractAddr: string) => {
  const tokenContract = new ethers.Contract(tokenContractAddr, ERC20Artifact.abi, cazzPayProvider) as ERC20;
  const [name, symbol, decimals] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol(),
    tokenContract.decimals()
  ]);
  return {
    name,
    symbol,
    decimals
  }
}
