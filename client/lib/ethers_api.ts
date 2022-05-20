/** TODO Remaining
 * Withdraw liquidity czp-other and czp-eth uniswap to be implemented
 * Buy With other token and ether redstone to be implemented
 * get the events from the required functions
 */
import { BigNumber, ethers, Signer } from "ethers";
import { CazzPay, CazzPayToken, TestCoin } from "../typechain";
import {
  AddedLiquidityToCzpAndOtherTokenPairEvent,
  BoughtWithCryptoEvent,
  CreatedPairWithCzpAndOtherTokenEvent,
  PurchaseConfirmedEvent,
  SellerInfoEvent,
  TokensSwappedEvent,
  WithdrawnLiquidityFromCzpAndOtherTokenPairEvent,
} from "../typechain/CazzPay";
import CazzPayInterface from "../contracts/CazzPay.json";
import CazzPayTokenInterface from "../contracts/CazzPayToken.json";
import TestCoinInterface from "../contracts/TestCoin.json";

const contractAddress: string = process.env.CAZZPAY_CONTRACT_ADDRESS as string;
const tokenAddress: string = process.env.CAZZPAY_TOKEN_ADDRESS as string;
const providers = new ethers.providers.JsonRpcProvider();

// const CazzPayContract = new ethers.Contract(
//   contractAddress,
//   CazzPayInterface.abi,
//   providers
// ) as CazzPay;
// const CazzPayTokenContract = new ethers.Contract(
//   tokenAddress,
//   CazzPayTokenInterface.abi,
//   providers
// ) as CazzPayToken;

const getValIncreased = (val: BigNumber, increasePerc: number) => {
  return val.add(BigNumber.from(val).mul(increasePerc).div(100));
};

const getValReduced = (val: BigNumber, reductionPerc: number) => {
  return val.sub(BigNumber.from(val).mul(reductionPerc).div(100));
};

const getDeadline = () => {
  return BigNumber.from((Date.now() / 1000).toFixed() + 120);
};

export async function setPaymentTransferFeesPerc(
  cazzPayContract: CazzPay,
  percentage: number
) {
  await cazzPayContract.setPaymentTransferFeesPerc(percentage);
}
export async function createPairWithCzpAndOtherToken(
  cazzPayContract: CazzPay,
  otherTokenAddress: string
) {
  const txn = await cazzPayContract.createPairWithCzpAndOtherToken(
    otherTokenAddress
  );
  const { events } = await txn.wait();
  const { pairAddr, otherTokenContractAddr } = (
    events?.find(
      ({ event }) => event === "CreatedPairWithCzpAndOtherToken"
    ) as CreatedPairWithCzpAndOtherTokenEvent
  )?.args;
  return {
    pairAddr,
    otherTokenContractAddr,
  };
}
export async function createPairWithCzpAndEth(
  cazzPayContract: CazzPay,
  signer: Signer
) {
  /** Wallet balance???? */
  const tx = await cazzPayContract.createPairWithCzpAndEth();
  const { events } = await tx.wait();
  const { pairAddr, otherTokenContractAddr } = (
    events?.find(
      ({ event }) => event === "CreatedPairWithCzpAndOtherToken"
    ) as CreatedPairWithCzpAndOtherTokenEvent
  )?.args;
  return {
    pairAddr,
    otherTokenContractAddr,
  };
}

export async function getCzpAndOtherTokenPairAddr(
  cazzPayContract: CazzPay,
  otherTokenAddress: string
) {
  return await cazzPayContract.getCzpAndOtherTokenPairAddr(otherTokenAddress);
}

export async function getAllPairsWithCzpAndOtherToken(
  cazzPayContract: CazzPay
) {
  return await cazzPayContract.getAllPairsWithCzpAndOtherToken();
}

/** function to add liquidity to czp-any token pair
 * @params - signer to sign the transaction
 * @params - other token address
 * @params - czp token amount to deposit
 * @params - other token amount to deposit */
export async function addLiquidityToCzpAndOtherTokenPair(
  signer: Signer,
  cazzPayContract: CazzPay,
  cazzPayTokenContract: CazzPayToken,
  otherTokenAddress: string,
  czpAmountOfDeposit: string,
  otherTokenAmountToDeposit: string
) {
  const parsedCzpAmount = ethers.utils.parseEther(czpAmountOfDeposit);
  const parsedOtherTokenAmonut = ethers.utils.parseEther(
    otherTokenAmountToDeposit
  );
  const otherTokenContract = new ethers.Contract(
    otherTokenAddress,
    TestCoinInterface.abi,
    signer
  ) as TestCoin;
  await cazzPayTokenContract
    .connect(signer)
    .approve(cazzPayContract.address, parsedCzpAmount);

  otherTokenContract
    .connect(signer)
    .approve(cazzPayContract.address, parsedOtherTokenAmonut);
  const tx = await cazzPayContract
    .connect(signer)
    .addLiquidityToCzpAndOtherTokenPair(
      otherTokenAddress,
      parsedCzpAmount,
      parsedOtherTokenAmonut,
      getValReduced(parsedCzpAmount, 2),
      getValReduced(parsedOtherTokenAmonut, 2),
      getDeadline()
    );
  const { events } = await tx.wait();
  const {
    otherTokenAmtAdded,
    czpAmtAdded,
    otherTokenContractAddr,
    liquidityProviderAddr,
    liquidityTokensMinted,
  } = (
    events?.find(
      ({ event }) => event === "AddedLiquidityToCzpAndOtherTokenPair"
    ) as AddedLiquidityToCzpAndOtherTokenPairEvent
  )?.args;
  return {
    otherTokenAmtAdded,
    czpAmtAdded,
    otherTokenContractAddr,
    liquidityProviderAddr,
    liquidityTokensMinted,
  };
}
/** function to add liquidity to czp-eth pair
 * @params - signer as a Signer type
 * @params - czp token amount to be deposited
 * @params - eth amount to deposit
 * payable function so we need to specify the Eth amount */
export async function addLiquidityToCzpAndEthPair(
  signer: Signer,
  cazzPayContract: CazzPay,
  cazzPayTokenContract: CazzPayToken,
  czpAmountToDeposit: string,
  ethAmountToDeposit: string
) {
  const parsedCzpAmount = ethers.utils.parseEther(czpAmountToDeposit);
  const parsedEthAmount = ethers.utils.parseEther(ethAmountToDeposit);
  await cazzPayTokenContract
    .connect(signer)
    .approve(cazzPayContract.address, parsedCzpAmount);
  const tx = await cazzPayContract
    .connect(signer)
    .addLiquidityToCzpAndEthPair(
      czpAmountToDeposit,
      getValReduced(parsedCzpAmount, 2),
      getValReduced(parsedEthAmount, 2),
      getDeadline(),
      { value: parsedEthAmount }
    );
  const { events } = await tx.wait();
  const {
    otherTokenAmtAdded,
    czpAmtAdded,
    otherTokenContractAddr,
    liquidityProviderAddr,
    liquidityTokensMinted,
  } = (
    events?.find(
      ({ event }) => event === "AddedLiquidityToCzpAndOtherTokenPair"
    ) as AddedLiquidityToCzpAndOtherTokenPairEvent
  )?.args;

  return {
    otherTokenAmtAdded,
    czpAmtAdded,
    otherTokenContractAddr,
    liquidityProviderAddr,
    liquidityTokensMinted,
  };
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
  cazzPayContract: CazzPay,
  otherTokenAddress: string,
  liquidityToWithdraw: BigNumber,
  minCzpToRecieve: BigNumber,
  minOtherTokenToRecieve: BigNumber
) {
  const pairTokenAddress = await cazzPayContract.getCzpAndOtherTokenPairAddr(
    otherTokenAddress
  );
  //uniswap to be implemented ???

  const tx = await cazzPayContract
    .connect(signer)
    .withdrawLiquidityForCzpAndOtherToken(
      otherTokenAddress,
      liquidityToWithdraw,
      minCzpToRecieve,
      minOtherTokenToRecieve,
      getDeadline()
    );
  const { events } = await tx.wait();
  const { czpAmtWithdrawn, otherTokenAmtWithdrawn, liquidityTokensSubmitted } =
    (
      events?.find(
        ({ event }) => event === "WithdrawnLiquidityFromCzpAndOtherTokenPair"
      ) as WithdrawnLiquidityFromCzpAndOtherTokenPairEvent
    ).args;

  return {
    czpAmtWithdrawn,
    otherTokenAmtWithdrawn,
    liquidityTokensSubmitted,
  };
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
  cazzPayContract: CazzPay,
  minCzpToRecieve: BigNumber,
  minEthToRecieve: BigNumber
) {
  /** uniswap to be implemented */
  const tx = await cazzPayContract
    .connect(signer)
    .withdrawLiquidityForCzpAndEth(
      liquidityToWithdraw,
      minCzpToRecieve,
      minEthToRecieve,
      getDeadline()
    );
  const { events } = await tx.wait();
  const {
    czpAmtWithdrawn,
    otherTokenAmtWithdrawn: ethTokenAmtWithdrawn,
    liquidityTokensSubmitted,
  } = (
    events?.find(
      ({ event }) => event === "WithdrawnLiquidityFromCzpAndOtherTokenPair"
    ) as WithdrawnLiquidityFromCzpAndOtherTokenPairEvent
  ).args;

  return {
    czpAmtWithdrawn,
    ethTokenAmtWithdrawn,
    liquidityTokensSubmitted,
  };
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
  recipientAccountIdToPay: string,
  cazzPayContract: CazzPay,
  otherTokenAddress: string,
  otherTokenAmount: string, //this parameter is to be changed by redstone
  fiatAmtToPay: string
) {
  const parsedFiatAmt = ethers.utils.parseEther(fiatAmtToPay);
  // Redstone to be implemented
  const parsedOtherTokenAmt = ethers.utils.parseEther(otherTokenAmount);
  const maxOtherTokenAmount = getValIncreased(parsedOtherTokenAmt, 2);
  const otherTokenContract = new ethers.Contract(
    otherTokenAddress,
    TestCoinInterface.abi,
    signer
  ) as TestCoin;
  otherTokenContract
    .connect(signer)
    .approve(cazzPayContract.address, maxOtherTokenAmount);
  const tx = await cazzPayContract
    .connect(signer)
    .buyWithCryptoToken(
      recipientAccountIdToPay,
      otherTokenAddress,
      maxOtherTokenAmount,
      parsedFiatAmt,
      getDeadline()
    );
  const { events } = await tx.wait();
  const buyEvent = events?.find(
    ({ event }) => event === "BoughtWithCrypto"
  ) as BoughtWithCryptoEvent;
  const {
    payerWalletAddr,
    recipientAccountId,
    cazzPayTransactionId,
    tokenAmtUsedForPurchased,
    tokenUsedForPurchaseContractAddr,
    fiatAmountPaid,
    fiatAmountToPayToSeller,
  } = buyEvent?.args;

  return {
    payerWalletAddr,
    recipientAccountId,
    cazzPayTransactionId,
    tokenAmtUsedForPurchased,
    tokenUsedForPurchaseContractAddr,
    fiatAmountPaid,
    fiatAmountToPayToSeller,
  };
}
/** Function to buy things with Ethereum
 * @params signer as a Signer
 * @params recipient account id : seller account
 * @params fiat amount to be paid to seller
 */
export async function buyWithEth(
  signer: Signer,
  cazzPayContract: CazzPay,
  recipientAccountIdToPay: string,
  fiatAmtToPay: string
) {
  const parsedFiatAmt = ethers.utils.parseEther(fiatAmtToPay);
  //Redstone to be implemented ??
  const tx = await cazzPayContract.connect(signer).buyWithEth(
    recipientAccountIdToPay,
    fiatAmtToPay,
    getDeadline(),
    {} // here value should be passed
  );
  const { events } = await tx.wait();
  const buyEvent = events?.find(
    ({ event }) => event === "BoughtWithCrypto"
  ) as BoughtWithCryptoEvent;
  const {
    payerWalletAddr,
    recipientAccountId,
    cazzPayTransactionId,
    tokenAmtUsedForPurchased,
    tokenUsedForPurchaseContractAddr,
    fiatAmountPaid,
    fiatAmountToPayToSeller,
  } = buyEvent?.args;

  return {
    payerWalletAddr,
    recipientAccountId,
    cazzPayTransactionId,
    tokenAmtUsedForPurchased,
    tokenUsedForPurchaseContractAddr,
    fiatAmountPaid,
    fiatAmountToPayToSeller,
  };
}
/** Function to swap other token for czp
 * @params signer as Signer
 * @params other token contract address
 * @params other token amount to be swapped
 * @params czp minimum amount to be recieved
 */
export async function swapOtherTokensForCzp(
  signer: Signer,
  cazzPayContract: CazzPay,
  otherTokenContractAddress: string,
  otherTokenAmtToSwap: string,
  czpMinAmt: string
) {
  const parsedOtherTokenAmount = ethers.utils.parseEther(otherTokenAmtToSwap);
  const minCzpToGetParsed = ethers.utils.parseEther(czpMinAmt);
  const otherTokenContract = new ethers.Contract(
    otherTokenContractAddress,
    TestCoinInterface.abi,
    signer
  ) as TestCoin;
  otherTokenContract
    .connect(signer)
    .approve(cazzPayContract.address, parsedOtherTokenAmount);
  const tx = await cazzPayContract.swapOtherTokensForCzp(
    otherTokenContractAddress,
    parsedOtherTokenAmount,
    minCzpToGetParsed,
    getDeadline()
  );
  const { events } = await tx.wait();
  const {
    inputTokenAmt,
    inputTokenContractAddr,
    outputTokenAmt,
    outputTokenContractAddr,
  } = (
    events?.find(({ event }) => event === "TokensSwapped") as TokensSwappedEvent
  )?.args;

  return {
    inputTokenAmt,
    inputTokenContractAddr,
    outputTokenAmt,
    outputTokenContractAddr,
  };
}
/** Function to swap czp for other tokens
 * @params signer as Signer
 * @params other token address
 * @params czp amount to be swapped
 * @params other token minimum amount to be recieved
 */
export async function swapCzpForOtherTokens(
  signer: Signer,
  cazzPayContract: CazzPay,
  cazzPayTokenContract: CazzPayToken,
  otherTokenAddress: string,
  czpAmtToSwap: string,
  otherTokenMinAmt: string
) {
  const parsedCzpAmountToSwap = ethers.utils.parseEther(czpAmtToSwap);
  const otherTokenMinAmtToGetParsed = ethers.utils.parseEther(otherTokenMinAmt);
  await cazzPayTokenContract
    .connect(signer)
    .approve(cazzPayContract.address, parsedCzpAmountToSwap);
  const tx = await cazzPayContract.swapCzpForOtherTokens(
    otherTokenAddress,
    parsedCzpAmountToSwap,
    otherTokenMinAmtToGetParsed,
    getDeadline()
  );
  const { events } = await tx.wait();
  const {
    inputTokenAmt,
    inputTokenContractAddr,
    outputTokenAmt,
    outputTokenContractAddr,
  } = (
    events?.find(({ event }) => event === "TokensSwapped") as TokensSwappedEvent
  )?.args;

  return {
    inputTokenAmt,
    inputTokenContractAddr,
    outputTokenAmt,
    outputTokenContractAddr,
  };
}

export async function storeSellerInfo(
  cazzPayContract: CazzPay,
  sellerIdToStore: string,
  sellerEmail: string,
  sellerName: string
) {
  const tx = await cazzPayContract.storeSellerInfo(
    sellerIdToStore,
    sellerEmail,
    sellerName
  );
  const { events } = await tx.wait();
  const { sellerId, email, name } = (
    events?.find(({ event }) => event === "SellerInfo") as SellerInfoEvent
  )?.args;
  return {
    sellerId,
    email,
    name,
  };
}
export async function setPurchaseConfirmation(
  cazzPayContract: CazzPay,
  transactionId: string
) {
  const tx = await cazzPayContract.setPurchaseConfirmation(transactionId);
  const { events } = await tx.wait();
  const { cazzPayTransactionId } = (
    events?.find(
      ({ event }) => event === "PurchaseConfirmed"
    ) as PurchaseConfirmedEvent
  )?.args;
  return { cazzPayTransactionId };
}
