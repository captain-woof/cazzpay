// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import "../CazzPayToken/CazzPayToken.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CazzPayDex {
    ////////////////////////
    // STORAGE
    ////////////////////////
    IUniswapV2Factory public immutable factoryContract;
    IUniswapV2Router02 public immutable routerContract;
    CazzPayToken public immutable czpContract;
    address public immutable wethContractAddr;

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

    ////////////////////////
    // FUNCTIONS
    ////////////////////////

    constructor(
        IUniswapV2Factory _factoryContractAddr,
        IUniswapV2Router02 _routerContractAddr,
        CazzPayToken _czpContract
    ) {
        factoryContract = _factoryContractAddr;
        routerContract = _routerContractAddr;
        wethContractAddr = routerContract.WETH();
        czpContract = _czpContract;
    }

    /*
    @title Create Pair with CZP and another token
    @notice Creates a pool with $CZP and another token
    @param _factoryContract Factory contract
    @param _czpContractAddr Contract address of CZP contract
    @param _otherTokenContractAddr Contract address of the other token to form pool with
    @returns Address of the pair created
    */
    function createPairWithCzp(
        IUniswapV2Factory _factoryContract,
        address _czpContractAddr,
        address _otherTokenContractAddr
    ) public returns (address poolAddr) {
        poolAddr = _factoryContract.createPair(
            _czpContractAddr,
            _otherTokenContractAddr
        );
        emit CreatedPairWithCzpAndOtherToken(poolAddr, _otherTokenContractAddr);
    }

    /**
    @notice Fetches the pair address of a CZP-OtherToken pool
    @param _czpContractAddr Address of the CZP contract
    @param _otherTokenContractAddr Address of the other token contract
    @return poolAddr Address of the pool
     */
    function getCzpAndOtherTokenPoolAddr(
        address _czpContractAddr,
        address _otherTokenContractAddr
    ) public view returns (address poolAddr) {
        return
            _factoryContract.getPair(_czpContractAddr, _otherTokenContractAddr);
    }

    /**
    @notice Gets all Pairs with CZP
    @param _czpContractAddr Address of the CZP contract
    @return pairAddrsWithCzpAndOtherToken List of all pairs that contains CZP
     */
    function getAllPairsWithCzpAndOtherToken(address _czpContractAddr)
        public
        view
        returns (address[] memory pairAddrsWithCzpAndOtherToken)
    {
        uint256 totalPairsNum = _factoryContract.allPairsLength();
        address[] memory pairAddrs = new address[](totalPairsNum);

        uint256 index = 0;
        IUniswapV2Pair pairContract;
        for (uint256 i = 0; i < totalPairsNum; i++) {
            pairContract = IUniswapV2Pair(_factoryContract.allPairs(i));
            if (
                pairContract.token0() == _czpContractAddr ||
                pairContract.token1() == _czpContractAddr
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
            wethContractAddr,
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
            wethContractAddr
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
            wethContractAddr,
            msg.sender,
            czpReceived,
            ethReceived,
            _liquidityToWithdraw
        );
    }
}
