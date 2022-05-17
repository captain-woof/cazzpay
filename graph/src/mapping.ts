import {
  BoughtWithCrypto,
  PurchaseConfirmed,
  SellerInfo
} from "../generated/CazzPay/CazzPay";
import { PurchaseTransaction, Seller } from "../generated/schema";

// BoughtWithCrypto
export function handleBoughtWithCrypto(event: BoughtWithCrypto): void {
  const purchaseTransaction = new PurchaseTransaction(event.params.cazzPayTransactionId.toString());

  purchaseTransaction.payerWalletAddr = event.params.payerWalletAddr;
  purchaseTransaction.recipientSeller = event.params.recipientAccountId;
  purchaseTransaction.tokenUsedForPurchaseContractAddr = event.params.tokenUsedForPurchaseContractAddr;
  purchaseTransaction.tokenAmtUsedForPurchased = event.params.tokenAmtUsedForPurchased;
  purchaseTransaction.fiatAmountPaid = event.params.fiatAmountPaid;
  purchaseTransaction.fiatAmountToPayToSeller = event.params.fiatAmountToPayToSeller;
  purchaseTransaction.confirmed = false;

  purchaseTransaction.save();
}

// PurchaseConfirmed
export function handlePurchaseConfirmed(event: PurchaseConfirmed): void {
  const cazzPayTransactionId = event.params.cazzPayTransactionId;
  const purchaseTransaction = PurchaseTransaction.load(cazzPayTransactionId.toString());

  if (!!purchaseTransaction) { // Confirm only if transaction exists
    purchaseTransaction.confirmed = true;
    purchaseTransaction.save();
  }
}

// SellerInfo
export function handleSellerInfo(event: SellerInfo): void {
  let seller = Seller.load(event.params.sellerId);

  if (!seller) { // If seller does not exist, create one
    seller = new Seller(event.params.sellerId);
  }

  seller.email = event.params.email;
  seller.name = event.params.name;
  seller.id = event.params.sellerId;

  seller.save();
}