// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IERC20.sol";
import "./interfaces/ICazzPayToken.sol";
import "../Ownable/MultiOwnable.sol";
import "./CazzPayOracle/CazzPayOracle.sol";

contract CazzPay is MultiOwnable, CazzPayOracle {
    ////////////////////////
    // STORAGE
    ////////////////////////
    IUniswapV2Factory public immutable factoryContract;
    IUniswapV2Router02 public immutable routerContract;
    ICazzPayToken public immutable czpContract;
    IERC20 public immutable wethContract;
    uint16 public paymentTransferFeesPerc; // This would be charged from seller when receiving payments; this number would be divided by 10000 before usage; e.g, for 0.01%, this value should be 1.

    ////////////////////////
    // MODIFIERS
    ////////////////////////
    modifier withinDeadline(uint256 _deadline) {
        require(block.timestamp <= _deadline, "DEADLINE CROSSED");
        _;
    }

    ////////////////////////
    // EVENTS
    ////////////////////////
    event CreatedPairWithCzpAndOtherToken(
        address indexed pairAddr,
        address indexed otherTokenContractAddr
    );

    event AddedLiquidityToCzpAndOtherTokenPair(
        address indexed otherTokenContractAddr,
        address indexed liquidityProviderAddr,
        uint256 czpAmtAdded,
        uint256 otherTokenAmtAdded,
        uint256 liquidityTokensMinted
    );

    event WithdrawnLiquidityFromCzpAndOtherTokenPair(
        address indexed otherTokenContractAddr,
        address indexed liquidityProviderAddr,
        uint256 czpAmtWithdrawn,
        uint256 otherTokenAmtWithdrawn,
        uint256 liquidityTokensSubmitted
    );

    event BoughtWithCrypto(
        address indexed payerWalletAddr,
        string indexed recipientAccountId,
        string indexed randomNonce,
        address tokenUsedForPurchaseContractAddr,
        uint256 tokenAmtUsedForPurchased,
        uint256 fiatAmountPaid /* Atomic */
    );

    event TokensSwapped(
        address indexed inputTokenContractAddr,
        address indexed outputTokenContractAddr,
        uint256 inputTokenAmt,
        uint256 outputTokenAmt
    );

    ////////////////////////
    // FUNCTIONS
    ////////////////////////

    /**
    @param _factoryContractAddr Address of the factory contract
    @param _routerContractAddr Address of the router contract
    @param _czpContractAddr Address of CZP contract
    @param _paymentTransferFeesPerc This would be charged from seller when receiving payments; this number would be divided by 10000 before usage; e.g, for 0.01%, this value should be 1.
    @param _approvedPriceFeedSigner Authorised signer to provide price feeds
     */
    constructor(
        IUniswapV2Factory _factoryContractAddr,
        IUniswapV2Router02 _routerContractAddr,
        ICazzPayToken _czpContractAddr,
        address _wethContractAddr,
        uint16 _paymentTransferFeesPerc,
        address _approvedPriceFeedSigner
    ) public CazzPayOracle(_approvedPriceFeedSigner) {
        factoryContract = _factoryContractAddr;
        routerContract = _routerContractAddr;
        wethContract = IERC20(_wethContractAddr);
        czpContract = _czpContractAddr;
        paymentTransferFeesPerc = _paymentTransferFeesPerc;
    }

    /**
    @notice Sets a new fees percentage for transfer
    @param _newPaymentTransferFeesPerc This would be charged from seller when receiving payments; this number would be divided by 10000 before usage; e.g, for 0.01%, this value should be 1.
     */
    function setPaymentTransferFeesPerc(uint16 _newPaymentTransferFeesPerc)
        external
        onlyOwners
    {
        paymentTransferFeesPerc = _newPaymentTransferFeesPerc;
    }

    /**
    @notice Creates a pair with $CZP and another token
    @param _otherTokenContractAddr Contract address of the other token to form pool with
    @return pairAddr Address of the pair created
    */
    function createPairWithCzpAndOtherToken(address _otherTokenContractAddr)
        public
        returns (address pairAddr)
    {
        pairAddr = factoryContract.createPair(
            address(czpContract),
            _otherTokenContractAddr
        );
        require(pairAddr != address(0), "PAIR NOT CREATED");
        emit CreatedPairWithCzpAndOtherToken(pairAddr, _otherTokenContractAddr);
    }

    /**
    @notice Creates a pair with $CZP and ETH
    @return pairAddr Address of the pair created
    */
    function createPairWithCzpAndEth()
        public
        payable
        returns (address pairAddr)
    {
        pairAddr = factoryContract.createPair(
            address(czpContract),
            address(wethContract)
        );
        require(pairAddr != address(0), "PAIR NOT CREATED");
        emit CreatedPairWithCzpAndOtherToken(pairAddr, address(wethContract));
    }

    /**
    @notice Fetches the pair address of a CZP-OtherToken pool
    @param _otherTokenContractAddr Address of the other token contract
    @return poolAddr Address of the pool
     */
    function getCzpAndOtherTokenPairAddr(address _otherTokenContractAddr)
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
    @dev Emits event AddedLiquidityToCzpAndOtherTokenPair(address indexed otherTokenContractAddr, address indexed liquidityProviderAddr, uint256 czpAmtAdded, uint256 otherTokenAmtAdded, uint256 liquidityTokensMinted);
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
    @dev Emits event AddedLiquidityToCzpAndOtherTokenPair(address indexed otherTokenContractAddr, address indexed liquidityProviderAddr, uint256 czpAmtAdded, uint256 otherTokenAmtAdded, uint256 liquidityTokensMinted);
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
            .addLiquidityETH{value: msg.value}(
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
    @dev Emits event WithdrawnLiquidityFromCzpAndOtherTokenPair(address indexed otherTokenContractAddr, address indexed liquidityProviderAddr, uint256 czpAmtWithdrawn, uint256 otherTokenAmtWithdrawn, uint256 liquidityTokensSubmitted);
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
    @dev Emits event WithdrawnLiquidityFromCzpAndOtherTokenPair(address indexed otherTokenContractAddr, address indexed liquidityProviderAddr, uint256 czpAmtWithdrawn, uint256 otherTokenAmtWithdrawn, uint256 liquidityTokensSubmitted);
     */
    function withdrawLiquidityForCzpAndEth(
        uint256 _liquidityToWithdraw,
        uint256 _minCzpToReceive,
        uint256 _minEthToReceive,
        uint256 _deadline
    ) public returns (uint256 czpReceived, uint256 ethReceived) {
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
    @notice Caller must approve this contract to spend the input tokens BEFORE calling this
    @param _recipientAccountId The account id of recipient (for indexing)
    @param _randomNonce A random nonce; would be used for payment verification later; buyer must submit this to verify and complete the transaction
    @param _otherTokenContractAddr Address of the token to use for purchase
    @param _otherTokenMaxAmtToPayWith Max amount of the 'other token' to use for purchase
    @param _fiatAmtToPay Fiat to transfer to seller; MUST BE ATOMIC WITH 18 decimals
    @param _deadline Deadline (unix secs) to execute this transaction
    @return otherTokenAmtUsed Amount of 'other token' used
    @return fiatAmountPaid Amount of FIAT paid to seller (with fees deducted); Atomic
    @dev Fires event BoughtWithCrypto(address payerWalletAddr, string recipientAccountId, string randomNonce, address tokenUsedForPurchaseContractAddr, uint256 tokenAmtUsedForPurchased, uint256 fiatAmountPaid);
     */
    function buyWithCryptoToken(
        string memory _recipientAccountId,
        string memory _randomNonce,
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

            // Check to see if Pair exists
            require(
                factoryContract.getPair(
                    address(czpContract),
                    _otherTokenContractAddr
                ) != address(0),
                "PAIR DOES NOT EXIST"
            );

            // Check to see if enough tokens are available
            uint256 otherTokenPriceInCzp = getPriceOfTokenInCzpWithTokenAddress(
                _otherTokenContractAddr
            );
            require(
                otherTokenPriceInCzp * _otherTokenMaxAmtToPayWith >=
                    _fiatAmtToPay,
                "INSUFFICIENT MAX AMOUNT"
            );

            // Transfer tokens to this contract
            IERC20(_otherTokenContractAddr).transferFrom(
                msg.sender,
                address(this),
                _otherTokenMaxAmtToPayWith
            );

            // Approve router to spend tokens
            IERC20(_otherTokenContractAddr).approve(
                address(routerContract),
                _otherTokenMaxAmtToPayWith
            );

            // Swap tokens
            address[] memory swapPath = new address[](2);
            swapPath[0] = _otherTokenContractAddr;
            swapPath[1] = address(czpContract);
            uint256[] memory amounts = routerContract.swapTokensForExactTokens(
                _fiatAmtToPay,
                _otherTokenMaxAmtToPayWith,
                swapPath,
                address(this),
                _deadline
            );
            otherTokenAmtUsed = amounts[0];

            // Calculate fee deducted amount
            uint256 fiatAmtToPayWithFeesDeducted = _calculateAmtWithFeesDeducted(
                    _fiatAmtToPay
                );

            // Burn CZP to simulate FIAT
            czpContract.burn(fiatAmtToPayWithFeesDeducted);

            // Refund unused tokens
            if (otherTokenAmtUsed < _otherTokenMaxAmtToPayWith) {
                IERC20(_otherTokenContractAddr).approve(
                    address(routerContract),
                    0
                );
                IERC20(_otherTokenContractAddr).transfer(
                    msg.sender,
                    _otherTokenMaxAmtToPayWith - otherTokenAmtUsed
                );
            }

            // Emit event
            emit BoughtWithCrypto(
                msg.sender,
                _recipientAccountId,
                _randomNonce,
                _otherTokenContractAddr,
                otherTokenAmtUsed,
                fiatAmtToPayWithFeesDeducted
            );

            // Return
            return (otherTokenAmtUsed, fiatAmtToPayWithFeesDeducted);
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
    @return fiatAmountPaid Amount of FIAT paid to seller (with fees deducted); Atomic
    @dev Fires event BoughtWithCrypto(address payerWalletAddr, string recipientAccountId, string randomNonce, address tokenUsedForPurchaseContractAddr, uint256 tokenAmtUsedForPurchased, uint256 fiatAmountPaid);
     */
    function buyWithEth(
        string memory _recipientAccountId,
        string memory _randomNonce,
        uint256 _ethMaxAmtToPayWith,
        uint256 _fiatAmtToPay,
        uint256 _deadline
    ) public payable returns (uint256 ethAmtUsed, uint256 fiatAmountPaid) {
        // Check to see if Pair exists
        require(
            factoryContract.getPair(
                address(czpContract),
                address(wethContract)
            ) != address(0),
            "PAIR DOES NOT EXIST"
        );

        // Check to see if enough tokens are available
        uint256 ethPriceInCzp = getPriceOfTokenInCzpWithTokenSymbol("ETH");
        require(
            ethPriceInCzp * _ethMaxAmtToPayWith >= _fiatAmtToPay,
            "INSUFFICIENT MAX AMOUNT"
        );

        // Transfer tokens to this contract
        wethContract.transferFrom(
            msg.sender,
            address(this),
            _ethMaxAmtToPayWith
        );

        // Approve router to spend tokens
        wethContract.approve(address(routerContract), _ethMaxAmtToPayWith);

        // Swap tokens
        address[] memory swapPath = new address[](2);
        swapPath[0] = address(wethContract);
        swapPath[1] = address(czpContract);
        uint256[] memory amounts = routerContract.swapETHForExactTokens(
            _fiatAmtToPay,
            swapPath,
            address(this),
            _deadline
        );
        ethAmtUsed = amounts[0];

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
            address(wethContract),
            ethAmtUsed,
            fiatAmtToPayWithFeesDeducted
        );

        // Return
        return (ethAmtUsed, fiatAmtToPayWithFeesDeducted);
    }

    /**
    @notice Function to swap tokens; swaps exact amount of Other tokens for maximum CZP tokens
    @notice Caller must approve this contract to spend the input tokens BEFORE calling this
    @param _otherTokenContractAddr Address of the Other token contract
    @param _otherTokenAmt Exact Other tokens amount
    @param _czpMinAmt Minimum output CZP to receive
    @param _deadline Deadline (unix secs) to execute this transaction
    @return otherTokenAmtUsed Other token amount used for swapping
    @return czpAmtReceived Amount of CZP received after swapping
    @dev Fires event event TokensSwapped(address inputTokenContractAddr, address outputTokenContractAddr, uint256 inputTokenAmt, uint256 outputTokenAmt);
     */
    function swapOtherTokensForCzp(
        address _otherTokenContractAddr,
        uint256 _otherTokenAmt,
        uint256 _czpMinAmt,
        uint256 _deadline
    ) public returns (uint256 otherTokenAmtUsed, uint256 czpAmtReceived) {
        return
            _swapTokens(
                _otherTokenContractAddr,
                address(czpContract),
                _otherTokenAmt,
                _czpMinAmt,
                _deadline
            );
    }

    /**
    @notice Function to swap tokens; swaps exact amount of Other tokens for maximum CZP tokens
    @notice Caller must approve this contract to spend the input tokens BEFORE calling this
    @param _otherTokenContractAddr Address of the Other token contract
    @param _czpAmt Exact CZP tokens amount
    @param _otherTokenMinAmt Minimum Other tokens to receive
    @param _deadline Deadline (unix secs) to execute this transaction
    @return czpAmtUsed Other token amount used for swapping
    @return otherTokenAmtReceived Amount of other tokens received after swapping
    @dev Fires event event TokensSwapped(address inputTokenContractAddr, address outputTokenContractAddr, uint256 inputTokenAmt, uint256 outputTokenAmt);
     */
    function swapCzpForOtherTokens(
        address _otherTokenContractAddr,
        uint256 _czpAmt,
        uint256 _otherTokenMinAmt,
        uint256 _deadline
    ) public returns (uint256 czpAmtUsed, uint256 otherTokenAmtReceived) {
        return
            _swapTokens(
                address(czpContract),
                _otherTokenContractAddr,
                _czpAmt,
                _otherTokenMinAmt,
                _deadline
            );
    }

    ///////////////////////////
    // INTERNAL FUNCTIONS
    ///////////////////////////

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
            ((_totalAmt * paymentTransferFeesPerc) / 10000);
        return totalAmtWithFeesDeducted;
    }

    /**
    @notice Function to swap tokens; swaps exact amount of input tokens for maximum output tokens
    @notice Caller must approve this contract to spend the input tokens BEFORE calling this
    @param _inputTokenContractAddr Address of the input token contract
    @param _outputTokenContractAddr Address of the output token contract
    @param _inputTokenAmt Exact input tokens amount
    @param _outputTokenMinAmt Minimum output tokens to receive
    @param _deadline Deadline (unix secs) to execute this transaction
    @return inputTokenAmtUsed Input token amount used for swapping
    @return outputTokenAmtReceived Amount of output token received after swapping
     */
    function _swapTokens(
        address _inputTokenContractAddr,
        address _outputTokenContractAddr,
        uint256 _inputTokenAmt,
        uint256 _outputTokenMinAmt,
        uint256 _deadline
    )
        internal
        returns (uint256 inputTokenAmtUsed, uint256 outputTokenAmtReceived)
    {
        // Transfer input tokens to this contract
        IERC20(_inputTokenContractAddr).transferFrom(
            msg.sender,
            address(this),
            _inputTokenAmt
        );

        // Approve router to spend the input tokens
        IERC20(_inputTokenContractAddr).approve(
            address(routerContract),
            _inputTokenAmt
        );

        // Perform token swap
        address[] memory swapPath = new address[](2);
        swapPath[0] = _inputTokenContractAddr;
        swapPath[0] = _outputTokenContractAddr;
        uint256[] memory amounts = routerContract.swapExactTokensForTokens(
            _inputTokenAmt,
            _outputTokenMinAmt,
            swapPath,
            msg.sender,
            _deadline
        );
        inputTokenAmtUsed = amounts[0];
        outputTokenAmtReceived = amounts[1];

        // Emit event
        emit TokensSwapped(
            _inputTokenContractAddr,
            _outputTokenContractAddr,
            inputTokenAmtUsed,
            outputTokenAmtReceived
        );
    }
}
