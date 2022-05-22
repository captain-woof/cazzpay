import axios from "axios";
import { Seller, Transaction } from "../types/graph";
const graphEndpoint: string = process.env.NEXT_PUBLIC_GRAPH_API_ENDPOINT as string;

/** Get Seller Details
 * @params sellerId for a particular seller
 */
export const getSellerDetails = async (sellerId: string): Promise<Seller> => {
  const response = await axios.post(graphEndpoint, {
    query: `{
      seller(id : "${sellerId}"){
        id
        email
        name
      }
    }`,
  });

  const seller = response.data.data.seller;
  return seller;
};
/** Get total number of Sellers */
export const totalSellerCount = async () => {
  const response = await axios.post(graphEndpoint, {
    query: `{
      sellers{
        id
      }
    }`,
  });
  const sellers: Array<Seller> = response.data.data.sellers;
  return sellers.length;
};

/** Get Total number of transactions under a seller */
export const totalTransactionsUnderSeller = async (
  sellerId: string
): Promise<number> => {
  const response = await axios.post(graphEndpoint, {
    query: `{
      seller(id:"${sellerId}"){
        transactionsReceived{
          id
        }
      }
    }`,
  });
  const seller = response.data.data.seller;
  let transactionsUnderSeller: Array<Transaction>;
  if (!!seller) {
    transactionsUnderSeller = seller.transactionsReceived;
  } else {
    transactionsUnderSeller = [];
  }
  return transactionsUnderSeller.length;
};
/** Fetch all transactions of a particular seller
 * @params sellerId for a particular seller
 * @params pageNumber for pagination
 * @params pageSize for how many seller to show
 */
export const getAllTransactionsUnderSeller = async (
  sellerId: string,
  pageNumber?: number,
  pageSize?: number
): Promise<Array<Transaction>> => {
  const response = await axios.post(graphEndpoint, {
    query: `{
      seller(id : "${sellerId}"){
        transactionsReceived(first:${pageSize},skip:${pageNumber}){
          id
          payerWalletAddr
          tokenUsedForPurchaseContractAddr
          tokenAmtUsedForPurchased
          fiatAmountPaid
          fiatAmountToPayToSeller
          confirmed
          timestampOfConfirmation
        }
      }
    }`,
  });

  const seller = response.data.data.seller;
  let transactionsUnderSeller: Array<Transaction>;
  if (!!seller) {
    transactionsUnderSeller = seller.transactionsReceived;
  } else {
    transactionsUnderSeller = [];
  }
  return transactionsUnderSeller;
};

/** Get the list of all sellers */
export const listOfSellers = async (): Promise<Array<Seller>> => {
  const response = await axios.post(graphEndpoint, {
    query: `{
      sellers{
        id
        email
        name
      }
    }`,
  });
  const sellers: Array<Seller> = response.data.data.sellers;
  return sellers;
};

/** Fetch all transactions of a particular seller
 * @param cazzPayTransactionId ID for a particular transaction
 * @return Transaction details of provided ID
 */
export const getTransactionById = async (cazzPayTransactionId: string) => {
  const response = await axios.post(graphEndpoint, {
    query: `{
      purchaseTransaction(id: ${cazzPayTransactionId}) {
        id
        payerWalletAddr
        recipientSeller {
          id,
          email,
          name
        }
        tokenUsedForPurchaseContractAddr
        tokenAmtUsedForPurchased
        fiatAmountPaid
        fiatAmountToPayToSeller
        confirmed
        timestampOfConfirmation
      }
    }`,
  });

  if (!!response.data.data) {
    const transaction: Transaction = response.data.data.purchaseTransaction;
    return transaction;
  }
  return null;
};