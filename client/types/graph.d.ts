import { BigNumber } from "ethers";

export interface Seller {
  id: string;
  name?: string;
  email?: string;
  transactionsReceived?: Array<Transaction>;
}

export interface Transaction {
  id: string;
  payerWalletAddr: string;
  recipientSeller: Seller;
  tokenUsedForPurchaseContractAddr: string;
  tokenAmtUsedForPurchased: BigNumber;
  fiatAmountPaid: BigNumber;
  fiatAmountToPayToSeller: BigNumber;
  confirmed: boolean;
  timestampOfConfirmation: BigNumber;
}

export interface TransactionExtended extends Transaction {
  tokenUsedForPurchaseDecimals: number;
  tokenUsedForPurchaseSymbol: string;
  tokenUsedForPurchaseName: string;
}