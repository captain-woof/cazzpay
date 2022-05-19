/** TODO Remaining
 * Withdraw liquidity czp-other and czp-eth uniswap to be implemented
 * Buy With other token and ether redstone to be implemented
 * get the events from the required functions
 */

import { BigNumber, ethers, Signer } from "ethers";
import { CazzPay } from "../typechain";
import CazzPayInterface from "../contracts/CazzPay.json";
const contractAddress: string = process.env.CAZZPAY_TOKEN_ADDRESS as string;

const providers = new ethers.providers.JsonRpcProvider();

const CazzPayContract = new ethers.Contract(
  contractAddress,
  CazzPayInterface.abi,
  providers
) as CazzPay;

const getValIncreased = (val: BigNumber, increasePerc: number) => {
  return val.add(BigNumber.from(val).mul(increasePerc).div(100));
};

const getValReduced = (val: BigNumber, reductionPerc: number) => {
  return val.sub(BigNumber.from(val).mul(reductionPerc).div(100));
};

const getDeadline = () => {
  return BigNumber.from((Date.now() / 1000).toFixed() + 120);
};

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

/** function to add liquidity to czp-any token pair
 * @params - signer to sign the transaction
 * @params - other token address
 * @params - czp token amount to deposit
 * @params - other token amount to deposit
 */
export async function addLiquidityToCzpAndOtherTokenPair(
  signer: Signer,
  otherTokenAddress: string,
  czpAmountOfDeposit: string,
  otherTokenAmountToDeposit: string
) {
  const parsedCzpAmount = ethers.utils.parseEther(czpAmountOfDeposit);
  const parsedOtherTokenAmonut = ethers.utils.parseEther(
    otherTokenAmountToDeposit
  );

  await CazzPayContract.addLiquidityToCzpAndOtherTokenPair(
    otherTokenAddress,
    parsedCzpAmount,
    parsedOtherTokenAmonut,
    getValReduced(parsedCzpAmount, 2),
    getValReduced(parsedOtherTokenAmonut, 2),
    getDeadline()
  );
}
/** function to add liquidity to czp-eth pair
 * @params - signer as a Signer type
 * @params - czp token amount to be deposited
 * @params - eth amount to deposit
 * payable function so we need to specify the Eth amount
 */
export async function addLiquidityToCzpAndEthPair(
  signer: Signer,
  czpAmountToDeposit: string,
  ethAmountToDeposit: string
) {
  const parsedCzpAmount = ethers.utils.parseEther(czpAmountToDeposit);
  const parsedEthAmount = ethers.utils.parseEther(ethAmountToDeposit);
  await CazzPayContract.addLiquidityToCzpAndEthPair(
    czpAmountToDeposit,
    getValReduced(parsedCzpAmount, 2),
    getValReduced(parsedEthAmount, 2),
    getDeadline(),
    { value: parsedEthAmount }
  );
}
/** Function to withdraw liquidity for czp-other token pair
 * @params - signer as a Signer
 * @params - other token address
 * @params - liquidity to withdraw
 * @params - mininmum CZP to recieve
 * @params - minimum other token to recieve
 */
export async function withdrawLiquidityForCzpAndOtherToken(
  signer: Signer,
  otherTokenAddress: string,
  liquidityToWithdraw: BigNumber,
  minCzpToRecieve: BigNumber,
  minOtherTokenToRecieve: BigNumber
) {
  const pairTokenAddress = await CazzPayContract.getCzpAndOtherTokenPairAddr(
    otherTokenAddress
  );
  //uniswap to be implemented

  await CazzPayContract.withdrawLiquidityForCzpAndOtherToken(
    otherTokenAddress,
    liquidityToWithdraw,
    minCzpToRecieve,
    minOtherTokenToRecieve,
    getDeadline()
  );
}

/** Function to withdraw liquidity from CZP-ETH pair
 * @params signer as a Signer
 * @params liquidity to withdraw
 * @params minimum czp to receive
 * @params minimum eth to recieve
 */
export async function withdrawLiquidityForCzpAndEth(
  signer: Signer,
  liquidityToWithdraw: BigNumber,
  minCzpToRecieve: BigNumber,
  minEthToRecieve: BigNumber
) {
  /** uniswap to be implemented */
  await CazzPayContract.withdrawLiquidityForCzpAndEth(
    liquidityToWithdraw,
    minCzpToRecieve,
    minEthToRecieve,
    getDeadline()
  );
}
/** Function to buy things with any crypto Token
 * @params signer as a Signer
 * @params recipient account id
 * @params token address
 * @params token amount
 * @params fiat amount to be paid to seller
 */
export async function buyWithCryptoToken(
  signer: Signer,
  recipientAccountId: string,
  otherTokenAddress: string,
  otherTokenAmount: string,
  fiatAmtToPay: string
) {
  // Redstone to be implemented
  const parsedFiatAmt = ethers.utils.parseEther(fiatAmtToPay);
  const parsedOtherTokenAmt = ethers.utils.parseEther(otherTokenAmount);
  const maxOtherTokenAmount = getValIncreased(parsedOtherTokenAmt, 2);
  await CazzPayContract.buyWithCryptoToken(
    recipientAccountId,
    otherTokenAddress,
    maxOtherTokenAmount,
    parsedFiatAmt,
    getDeadline()
  );
}
/** Function to buy things with Ethereum
 * @params signer as a Signer
 * @params recipient account id : seller account
 * @params fiat amount to be paid to seller
 */
export async function buyWithEth(
  signer: Signer,
  recipientAccountId: string,
  fiatAmtToPay: string
) {
  //Redstone to be implemented
  const parsedFiatAmt = ethers.utils.parseEther(fiatAmtToPay);
  await CazzPayContract.buyWithEth(
    recipientAccountId,
    fiatAmtToPay,
    getDeadline(),
    {}
  );
}
/** Function to swap other token for czp
 * @params signer as Signer
 * @params other token contract address
 * @params other token amount to be swapped
 * @params czp minimum amount to be recieved
 */
export async function swapOtherTokensForCzp(
  signer: Signer,
  otherTokenContractAddress: string,
  otherTokenAmtToSwap: string,
  czpMinAmt: string
) {
  const parsedOtherTokenAmount = ethers.utils.parseEther(otherTokenAmtToSwap);
  const minCzpToGetParsed = ethers.utils.parseEther(czpMinAmt);
  await CazzPayContract.swapOtherTokensForCzp(
    otherTokenContractAddress,
    parsedOtherTokenAmount,
    minCzpToGetParsed,
    getDeadline()
  );
}
/** Function to swap czp for other tokens
 * @params signer as Signer
 * @params other token address
 * @params czp amount to be swapped
 * @params other token minimum amount to be recieved
 */
export async function swapCzpForOtherTokens(
  signer: Signer,
  otherTokenAddress: string,
  czpAmtToSwap: string,
  otherTokenMinAmt: string
) {
  const parsedCzpAmountToSwap = ethers.utils.parseEther(czpAmtToSwap);
  const otherTokenMinAmtToGetParsed = ethers.utils.parseEther(otherTokenMinAmt);
  await CazzPayContract.swapCzpForOtherTokens(
    otherTokenAddress,
    parsedCzpAmountToSwap,
    otherTokenMinAmtToGetParsed,
    getDeadline()
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
