import { ethers } from "ethers";
import { CazzPay } from "../typechain";
import CazzPayInterface from "../contracts/CazzPay.json";
const privateKey: string = process.env.WALLET_PRIVATE_KEY as string;
const contractAddress: string = process.env.CAZZPAY_TOKEN_ADDRESS as string;

const providers = new ethers.providers.JsonRpcProvider();
const signer = new ethers.Wallet(privateKey, providers);

const CazzPayContract = new ethers.Contract(
  contractAddress,
  CazzPayInterface.abi,
  signer
) as CazzPay;

export async function setPaymentTransferFeesPerc(percentage: number) {
  await CazzPayContract.setPaymentTransferFeesPerc(percentage);
}
export async function createPairWithCzpAndOtherToken(
  otherTokenAddress: string
) {
  const txn = await CazzPayContract.createPairWithCzpAndOtherToken(
    otherTokenAddress
  );
  const events = txn.wait();
}
export async function createPairWithCzpAndEth() {
  await CazzPayContract.createPairWithCzpAndEth();
}

export async function getCzpAndOtherTokenPairAddr(otherTokenAddress: string) {
  await CazzPayContract.getCzpAndOtherTokenPairAddr(otherTokenAddress);
}

export async function getAllPairsWithCzpAndOtherToken() {
  await CazzPayContract.getAllPairsWithCzpAndOtherToken();
}

export async function addLiquidityToCzpAndOtherTokenPair(
  otherTokenAddress: string,
  amountOfDeposit: number,
  otherTokenAmountToDeposit: number,
  minAmountOfCzpToDeposit: number,
  otherTokenMinAmountToDeposit: number,
  deadline: number
) {
  await CazzPayContract.addLiquidityToCzpAndOtherTokenPair(
    otherTokenAddress,
    amountOfDeposit,
    otherTokenAmountToDeposit,
    minAmountOfCzpToDeposit,
    otherTokenMinAmountToDeposit,
    deadline
  );
}

export async function addLiquidityToCzpAndEthPair(
  czpAmountToDeposit: number,
  czpMinAmountToDeposit: number,
  ethMinAmountToDeposit: number,
  deadline: number
) {
  await CazzPayContract.addLiquidityToCzpAndEthPair(
    czpAmountToDeposit,
    czpMinAmountToDeposit,
    ethMinAmountToDeposit,
    deadline
  );
}
export async function withdrawLiquidityForCzpAndOtherToken(
  otherTokenAddress: string,
  liquidityToWithdraw: number,
  minCzpToRecieve: number,
  minOtherTokenToRecieve: number,
  deadline: number
) {
  await CazzPayContract.withdrawLiquidityForCzpAndOtherToken(
    otherTokenAddress,
    liquidityToWithdraw,
    minCzpToRecieve,
    minOtherTokenToRecieve,
    deadline
  );
}
export async function withdrawLiquidityForCzpAndEth(
  liquidityToWithdraw: number,
  minCzpToRecieve: number,
  minEthToRecieve: number,
  deadline: number
) {
  await CazzPayContract.withdrawLiquidityForCzpAndEth(
    liquidityToWithdraw,
    minCzpToRecieve,
    minEthToRecieve,
    deadline
  );
}
export async function buyWithCryptoToken(
  recipientAccountId: string,
  otherTokenAddress: string,
  otherTokenMaxAmtToPayWith: number,
  fiatAmtToPay: number,
  deadline: number
) {
  await CazzPayContract.buyWithCryptoToken(
    recipientAccountId,
    otherTokenAddress,
    otherTokenMaxAmtToPayWith,
    fiatAmtToPay,
    deadline
  );
}
export async function buyWithEth(
  recipientAccountId: string,
  fiatAmtToPay: number,
  deadline: number
) {
  await CazzPayContract.buyWithEth(recipientAccountId, fiatAmtToPay, deadline);
}
export async function swapOtherTokensForCzp(
  otherTokenContractAddress: string,
  otherTokenAmt: number,
  czpMinAmt: number,
  deadline: number
) {
  await CazzPayContract.swapOtherTokensForCzp(
    otherTokenContractAddress,
    otherTokenAmt,
    czpMinAmt,
    deadline
  );
}
export async function swapCzpForOtherTokens(
  otherTokenAddress: string,
  czpAmt: number,
  otherTokenMinAmt: number,
  deadline: number
) {
  await CazzPayContract.swapCzpForOtherTokens(
    otherTokenAddress,
    czpAmt,
    otherTokenMinAmt,
    deadline
  );
}

export async function storeSellerInfo(
  sellerId: string,
  sellerEmail: string,
  sellerName: string
) {
  await CazzPayContract.storeSellerInfo(sellerId, sellerEmail, sellerName);
}
export async function setPurchaseConfirmation(transactionId: string) {
  await CazzPayContract.setPurchaseConfirmation(transactionId);
}
