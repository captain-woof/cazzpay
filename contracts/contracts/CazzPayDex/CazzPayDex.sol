// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import "../CazzPayToken/CazzPayToken.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../Ownable/MultiOwnable.sol";

contract CazzPayDex is MultiOwnable {
    ////////////////////////
    // STORAGE
    ////////////////////////
    IUniswapV2Factory public immutable factoryContract;
    IUniswapV2Router02 public immutable routerContract;
    CazzPayToken public immutable czpContract;
    IERC20 public immutable wethContract;
    uint16 public paymentTransferFeesPerc; // This would be charged from seller when receiving payments; this number would be divided by 10000 before usage; e.g, for 0.01%, this value should be 1.

    ////////////////////////
    // EVENTS
    ////////////////////////
    event CreatedPairWithCzpAndOtherToken(
        address poolAddr,
        address otherTokenContractAddr
    );

    event AddedLiquidityToCzpAndOtherTokenPair(
        address otherTokenContractAddr,
        address liquidityProviderAddr,
        uint256 czpAmtAdded,
        uint256 otherTokenAmtAdded,
        uint256 liquidityTokensMinted
    );

    event WithdrawnLiquidityFromCzpAndOtherTokenPair(
        address otherTokenContractAddr,
        address liquidityProviderAddr,
        uint256 czpAmtWithdrawn,
        uint256 otherTokenAmtWithdrawn,
        uint256 liquidityTokensSubmitted
    );

    event BoughtWithCrypto(
        address payerWalletAddr,
        string recipientAccountId,
        string randomNonce,
        address tokenUsedForPurchaseContractAddr,
        uint256 tokenAmtUsedForPurchased,
        uint256 fiatAmountPaid
    );

    ////////////////////////
    // FUNCTIONS
    ////////////////////////

    /**
    @param _factoryContractAddr Address of the factory contract
    @param _routerContractAddr Address of the router contract
    @param _czpContractAddr Address of CZP contract
    @param _paymentTransferFeesPerc This would be charged from seller when receiving payments; this number would be divided by 10000 before usage; e.g, for 0.01%, this value should be 1.
     */
    constructor(
        IUniswapV2Factory _factoryContractAddr,
        IUniswapV2Router02 _routerContractAddr,
        CazzPayToken _czpContractAddr,
        uint16 _paymentTransferFeesPerc
    ) {
        factoryContract = _factoryContractAddr;
        routerContract = _routerContractAddr;
        wethContract = IERC20(routerContract.WETH());
        czpContract = _czpContractAddr;
        paymentTransferFeesPerc = _paymentTransferFeesPerc;
    }

    /**
    @notice Sets a new fees percentage for transfer
    @param _newPaymentTransferFeesPerc This would be charged from seller when receiving payments; this number would be divided by 10000 before usage; e.g, for 0.01%, this value should be 1.
     */
    function setPaymentTransferFeesPerc(uint16 _newPaymentTransferFeesPerc)
        external
        onlyOwner
    {
        paymentTransferFeesPerc = _newPaymentTransferFeesPerc;
    }

    /**
    @notice Calculates the amount after deducting fees from it
    @param _totalAmt Total amount to deduct fees from
    @return totalAmtWithFeesDeducted Amount after fees would be deducted
     */
    function _calculateAmtWithFeesDeducted(uint256 _totalAmt)
        internal
        view
        returns (uint256 totalAmtWithFeesDeducted)
    {
        totalAmtWithFeesDeducted =
            _totalAmt -
            ((_totalAmt * _paymentTransferFeesPerc) / 10000);
        return totalAmtWithFeesDeducted;
    }

    /**
    @notice Creates a pair with $CZP and another token
    @param _otherTokenContractAddr Contract address of the other token to form pool with
    @return poolAddr Address of the pair created
    */
    function createPairWithCzpAndOtherToken(address _otherTokenContractAddr)
        public
        returns (address poolAddr)
    {
        poolAddr = factoryContract.createPair(
            address(czpContract),
            _otherTokenContractAddr
        );
        emit CreatedPairWithCzpAndOtherToken(poolAddr, _otherTokenContractAddr);
    }

    /**
    @notice Creates a pair with $CZP and ETH
    @return poolAddr Address of the pair created
    */
    function createPairWithCzpAndEth()
        public
        payable
        returns (address poolAddr)
    {
        poolAddr = _factoryContract.createPair(
            address(czpContract),
            address(wethContract)
        );
        emit CreatedPairWithCzpAndOtherToken(poolAddr, address(wethContract));
    }

    /**
    @notice Fetches the pair address of a CZP-OtherToken pool
    @param _otherTokenContractAddr Address of the other token contract
    @return poolAddr Address of the pool
     */
    function getCzpAndOtherTokenPoolAddr(address _otherTokenContractAddr)
        public
        view
        returns (address poolAddr)
    {
        return
            factoryContract.getPair(
                address(czpContract),
                _otherTokenContractAddr
            );
    }

    /**
    @notice Gets all Pairs with CZP
    @return pairAddrsWithCzpAndOtherToken List of all pairs that contains CZP
     */
    function getAllPairsWithCzpAndOtherToken()
        public
        view
        returns (address[] memory pairAddrsWithCzpAndOtherToken)
    {
        uint256 totalPairsNum = factoryContract.allPairsLength();
        address[] memory pairAddrs = new address[](totalPairsNum);

        uint256 index = 0;
        IUniswapV2Pair pairContract;
        for (uint256 i = 0; i < totalPairsNum; i++) {
            pairContract = IUniswapV2Pair(factoryContract.allPairs(i));
            if (
                pairContract.token0() == address(czpContract) ||
                pairContract.token1() == address(czpContract)
            ) {
                pairAddrs[index] = address(pairContract);
                index += 1;
            }
        }

        pairAddrsWithCzpAndOtherToken = new address[](index);
        for (uint256 i = 0; i < totalPairsNum; i++) {
            pairAddrsWithCzpAndOtherToken[i] = pairAddrs[i];
        }
    }

    /**
    @notice Adds liquidity to a CZP-OtherToken pair
    @notice Caller must approve this contract to spend the required tokens BEFORE calling this
    @notice Unused CZP and OtherToken are refunded
    @param _otherTokenContractAddr Address of the other token contract
    @param _czpAmtToDeposit Amount of CZP to deposit
    @param _otherTokenAmtToDeposit Amount of other token to deposit
    @param _czpMinAmtToDeposit Minimum amount of CZP to deposit
    @param _otherTokenMinAmtToDeposit Minimum amount of other token to deposit
    @param _deadline Deadline (unix secs) to execute this
    @return czpAmtAdded Amount of CZP added
    @return otherTokenAmtAdded Amount of other token added
    @return liquidityTokensMinted Amount of LP tokens minted to caller
     */
    function addLiquidityToCzpAndOtherTokenPair(
        address _otherTokenContractAddr,
        uint256 _czpAmtToDeposit,
        uint256 _otherTokenAmtToDeposit,
        uint256 _czpMinAmtToDeposit,
        uint256 _otherTokenMinAmtToDeposit,
        uint256 _deadline
    )
        public
        returns (
            uint256 czpAmtAdded,
            uint256 otherTokenAmtAdded,
            uint256 liquidityTokensMinted
        )
    {
        // Transfer tokens to this contract
        czpContract.transferFrom(msg.sender, address(this), _czpAmtToDeposit);
        IERC20(_otherTokenContractAddr).transferFrom(
            msg.sender,
            address(this),
            _otherTokenAmtToDeposit
        );

        // Approve router to spend tokens
        czpContract.approve(address(routerContract), _czpAmtToDeposit);
        IERC20(_otherTokenContractAddr).approve(
            address(routerContract),
            _otherTokenAmtToDeposit
        );

        // Add liquidity with tokens
        (
            czpAmtAdded,
            otherTokenAmtAdded,
            liquidityTokensMinted
        ) = routerContract.addLiquidity(
            address(czpContract),
            _otherTokenContractAddr,
            _czpAmtToDeposit,
            _otherTokenAmtToDeposit,
            _czpMinAmtToDeposit,
            _otherTokenMinAmtToDeposit,
            msg.sender,
            _deadline
        );

        // Refund remaining tokens
        if (czpAmtAdded < _czpAmtToDeposit) {
            czpContract.approve(address(routerContract), 0);
            czpContract.transfer(msg.sender, _czpAmtToDeposit - czpAmtAdded);
        }

        if (otherTokenAmtAdded < _otherTokenAmtToDeposit) {
            IERC20(_otherTokenContractAddr).approve(address(routerContract), 0);
            IERC20(_otherTokenContractAddr).transfer(
                msg.sender,
                _otherTokenAmtToDeposit - otherTokenAmtAdded
            );
        }

        // Fire event
        emit AddedLiquidityToCzpAndOtherTokenPair(
            _otherTokenContractAddr,
            msg.sender,
            czpAmtAdded,
            otherTokenAmtAdded,
            liquidityTokensMinted
        );
    }

    /**
    @notice Adds liquidity to a CZP-OtherToken pair
    @notice Caller must approve this contract to spend the required tokens BEFORE calling this
    @notice Caller must also provide ETH; treated as ETH to deposit
    @notice Unused CZP and ETH are refunded
    @param _czpAmtToDeposit Amount of CZP to deposit
    @param _czpMinAmtToDeposit Minimum amount of CZP to deposit
    @param _ethMinAmtToDeposit Minimum amount of ETH to deposit
    @param _deadline Deadline (unix secs) to execute this
    @return czpAmtAdded Amount of CZP added
    @return ethAmtAdded Amount of ETH added
    @return liquidityTokensMinted Amount of LP tokens minted to caller
     */
    function addLiquidityToCzpAndEthPair(
        uint256 _czpAmtToDeposit,
        uint256 _czpMinAmtToDeposit,
        uint256 _ethMinAmtToDeposit,
        uint256 _deadline
    )
        public
        payable
        returns (
            uint256 czpAmtAdded,
            uint256 ethAmtAdded,
            uint256 liquidityTokensMinted
        )
    {
        // Transfer CZP to this contract
        czpContract.transferFrom(msg.sender, address(this), _czpAmtToDeposit);

        // Approve router to spend CZP
        czpContract.approve(address(routerContract), _czpAmtToDeposit);

        // Add liquidity with CZP and ETH
        (czpAmtAdded, ethAmtAdded, liquidityTokensMinted) = routerContract
            .addLiquidityETH(
                address(czpContract),
                _czpAmtToDeposit,
                _czpMinAmtToDeposit,
                _ethMinAmtToDeposit,
                msg.sender,
                _deadline
            );

        // Refund remaining CZP
        if (czpAmtAdded < _czpAmtToDeposit) {
            czpContract.approve(address(routerContract), 0);
            czpContract.transfer(msg.sender, _czpAmtToDeposit - czpAmtAdded);
        }

        // Fire event
        emit AddedLiquidityToCzpAndOtherTokenPair(
            address(wethContract),
            msg.sender,
            czpAmtAdded,
            ethAmtAdded,
            liquidityTokensMinted
        );
    }

    /**
    @notice Removes liquidity from a CZP-OtherToken pair
    @notice Caller must approve this contract to spend the required LP-tokens BEFORE calling this
    @param _otherTokenContractAddr Other token's contract address
    @param _liquidityToWithdraw Amount of liquidity to withdraw
    @param _minCzpToReceive Minimum amount of CZP to receieve
    @param _minOtherTokenToReceive Minimum amount of other tokens to receieve
    @param _deadline Deadline (unix secs) to execute this
     */
    function withdrawLiquidityForCzpAndOtherToken(
        address _otherTokenContractAddr,
        uint256 _liquidityToWithdraw,
        uint256 _minCzpToReceive,
        uint256 _minOtherTokenToReceive,
        uint256 _deadline
    ) public returns (uint256 czpReceived, uint256 otherTokenReceived) {
        // Check if pair exists
        address pairAddr = factoryContract.getPair(
            address(czpContract),
            _otherTokenContractAddr
        );
        require(pairAddr != address(0), "PAIR DOES NOT EXIST");

        // Transfer LP token to this contract
        IUniswapV2Pair(pairAddr).transferFrom(
            msg.sender,
            address(this),
            _liquidityToWithdraw
        );

        // Approve router to spend LP token
        IUniswapV2Pair(pairAddr).approve(
            address(routerContract),
            _liquidityToWithdraw
        );

        // Withdraw liquidity
        (czpReceived, otherTokenReceived) = routerContract.removeLiquidity(
            address(czpContract),
            _otherTokenContractAddr,
            _liquidityToWithdraw,
            _minCzpToReceive,
            _minOtherTokenToReceive,
            msg.sender,
            _deadline
        );

        // Fire event
        emit WithdrawnLiquidityFromCzpAndOtherTokenPair(
            _otherTokenContractAddr,
            msg.sender,
            czpReceived,
            otherTokenReceived,
            _liquidityToWithdraw
        );
    }

    /**
    @notice Removes liquidity from a CZP-OtherToken pair
    @notice Caller must approve this contract to spend the required LP-tokens BEFORE calling this
    @param _liquidityToWithdraw Amount of liquidity to withdraw
    @param _minCzpToReceive Minimum amount of CZP to receieve
    @param _minEthToReceive Minimum amount of ETH to receieve
    @param _deadline Deadline (unix secs) to execute this
     */
    function withdrawLiquidityForCzpAndEth(
        uint256 _liquidityToWithdraw,
        uint256 _minCzpToReceive,
        uint256 _minEthToReceive,
        uint256 _deadline
    ) public returns (uint256 czpReceived, uint256 otherTokenReceived) {
        // Check if pair exists
        address pairAddr = factoryContract.getPair(
            address(czpContract),
            address(wethContract)
        );
        require(pairAddr != address(0), "PAIR DOES NOT EXIST");

        // Transfer LP token to this contract
        IUniswapV2Pair(pairAddr).transferFrom(
            msg.sender,
            address(this),
            _liquidityToWithdraw
        );

        // Approve router to spend LP token
        IUniswapV2Pair(pairAddr).approve(
            address(routerContract),
            _liquidityToWithdraw
        );

        // Withdraw liquidity
        (czpReceived, ethReceived) = routerContract.removeLiquidityETH(
            address(czpContract),
            _liquidityToWithdraw,
            _minCzpToReceive,
            _minEthToReceive,
            msg.sender,
            _deadline
        );

        // Fire event
        emit WithdrawnLiquidityFromCzpAndOtherTokenPair(
            address(wethContract),
            msg.sender,
            czpReceived,
            ethReceived,
            _liquidityToWithdraw
        );
    }

    /**
    @notice Called by buyer to pay to seller. Any extra tokens are refunded. Since this is a purchase, a payment transfer fee is charged IN ADDITION to the swapping fees
    @param _recipientAccountId The account id of recipient (for indexing)
    @param _randomNonce A random nonce; would be used for payment verification later; buyer must submit this to verify and complete the transaction
    @param _otherTokenContractAddr Address of the token to use for purchase
    @param _otherTokenMaxAmtToPayWith Max amount of the 'other token' to use for purchase
    @param _fiatAmtToPay Fiat to transfer to seller; MUST BE ATOMIC WITH 18 decimals
    @param _deadline Deadline (unix secs) to execute this transaction
    @return otherTokenAmtUsed Amount of 'other token' used
    @return fiatAmountPaid Amount of FIAT paid to seller (with fees deducted)
    @dev Fires event BoughtWithCrypto(address payerWalletAddr, string recipientAccountId, string randomNonce, address tokenUsedForPurchaseContractAddr, uint256 tokenAmtUsedForPurchased, uint256 fiatAmountPaid);
     */
    function buyWithCryptoToken(
        string _recipientAccountId,
        string _randomNonce,
        address _otherTokenContractAddr,
        uint256 _otherTokenMaxAmtToPayWith,
        uint256 _fiatAmtToPay,
        uint256 _deadline
    ) public returns (uint256 otherTokenAmtUsed, uint256 fiatAmountPaid) {
        // If 'other token' is czp, no swap is needed, else swap needed
        if (_otherTokenContractAddr == address(czpContract)) {
            // Check if tokens are enough
            require(
                _fiatAmtToPay < _otherTokenMaxAmtToPayWith,
                "INSUFFICIENT MAX AMOUNT"
            );

            // Transfer token to this contract
            czpContract.transferFrom(msg.sender, address(this), _fiatAmtToPay);

            // Calculate fee deducted amount
            uint256 fiatAmtToPayWithFeesDeducted = _calculateAmtWithFeesDeducted(
                    _fiatAmtToPay
                );

            // Burn CZP to simulate FIAT
            czpContract.burn(fiatAmtToPayWithFeesDeducted);

            // Emit event
            emit BoughtWithCrypto(
                msg.sender,
                _recipientAccountId,
                _randomNonce,
                _otherTokenContractAddr,
                _fiatAmtToPay,
                fiatAmtToPayWithFeesDeducted
            );

            // Return
            return (_fiatAmtToPay, fiatAmtToPayWithFeesDeducted);
        } else {
            // If 'other token' is not CZP, swapping is needed
            /* TODO: Get price of 'other token'

            // Check to see if Pair exists
            require(factoryContract.getPair(address(czpContract),_otherTokenContractAddr) != address(0), "PAIR DOES NOT EXIST");

            // Check to see if enough tokens are available
            uint256 otherTokenPriceInCzp = ...
            require(otherTokenPriceInCzp * _otherTokenMaxAmtToPayWith >= _fiatAmtToPay, "INSUFFICIENT MAX AMOUNT");

            // Transfer tokens to this contract
            IERC20(_otherTokenContractAddr).transferFrom(msg.sender, address(this), _otherTokenMaxAmtToPayWith);

            // Approve router to spend tokens
            IERC20(_otherTokenContractAddr).approve(address(routerContract), _otherTokenMaxAmtToPayWith);

            // Swap tokens
            address[] memory swapPath = new address[
                _otherTokenContractAddr,
                address(czpContract)
            ](2); 
            (otherTokenAmtUsed, czpAmtReceived) = routerContract.swapTokensForExactTokens(
                _fiatAmtToPay,
                _otherTokenMaxAmtToPayWith,
                swapPath,
                address(this),
                _deadline
            );

            // Burn CZP to simulate FIAT
            czpContract.burn(czpAmtReceived);

            // Refund unused tokens
            if(otherTokenAmtUsed < _otherTokenMaxAmtToPayWith){
                IERC20(_otherTokenContractAddr).approve(address (routerContract), 0);
                IERC20(_otherTokenContractAddr).transfer(msg.sender, _otherTokenMaxAmtToPayWith - otherTokenAmtUsed);
            }

            // Emit event
            emit BoughtWithCrypto(
                msg.sender,
                _recipientAccountId,
                _randomNonce,
                _otherTokenContractAddr,
                otherTokenAmtUsed,
                czpAmtReceived
            );

            // Return
            return(otherTokenAmtUsed, czpAmtReceived);
            */
        }
    }

    /**
    @notice Called by buyer to pay to seller. Any extra tokens are refunded. Since this is a purchase, a payment transfer fee is charged IN ADDITION to the swapping fees
    @param _recipientAccountId The account id of recipient (for indexing)
    @param _randomNonce A random nonce; would be used for payment verification later; buyer must submit this to verify and complete the transaction
    @param _ethMaxAmtToPayWith Max amount of ETH to use for purchase
    @param _fiatAmtToPay Fiat to transfer to seller; MUST BE ATOMIC WITH 18 decimals
    @param _deadline Deadline (unix secs) to execute this transaction
    @return ethAmtUsed Amount of ETH used
    @return fiatAmountPaid Amount of FIAT paid to seller (with fees deducted)
    @dev Fires event BoughtWithCrypto(address payerWalletAddr, string recipientAccountId, string randomNonce, address tokenUsedForPurchaseContractAddr, uint256 tokenAmtUsedForPurchased, uint256 fiatAmountPaid);
     */
    function buyWithEth(
        string _recipientAccountId,
        string _randomNonce,
        uint256 _ethMaxAmtToPayWith,
        uint256 _fiatAmtToPay,
        uint256 _deadline
    ) public payable returns (uint256 ethAmtUsed, uint256 fiatAmountPaid) {
        /* TODO: Get price of 'other token'

        // Check to see if Pair exists
        require(factoryContract.getPair(address(czpContract),address(wethContract)) != address(0), "PAIR DOES NOT EXIST");

        // Check to see if enough tokens are available
        uint256 ethPriceInCzp = ...
        require(ethPriceInCzp * _ethMaxAmtToPayWith >= _fiatAmtToPay, "INSUFFICIENT MAX AMOUNT");

        // Transfer tokens to this contract
        wethContract.transferFrom(msg.sender, address(this), _ethMaxAmtToPayWith);

        // Approve router to spend tokens
        wethContract.approve(address(routerContract), _ethMaxAmtToPayWith);

        // Swap tokens
        address[] memory swapPath = new address[
            address(wethContract),
            address(czpContract)
        ](2); 
        (ethAmtUsed, czpAmtReceived) = routerContract.swapETHForExactTokens(
            _fiatAmtToPay,
            swapPath,
            address(this),
            _deadline
        );

        // Burn CZP to simulate FIAT
        czpContract.burn(czpAmtReceived);

        // Emit event
        emit BoughtWithCrypto(
            msg.sender,
            _recipientAccountId,
            _randomNonce,
            address(wethContract),
            ethAmtUsed,
            czpAmtReceived
        );

        // Return
        return(ethAmtUsed, czpAmtReceived);
        */
    }
}
