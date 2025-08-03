// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./EtherlinkBridge.sol";
import "./EtherlinkPriceOracle.sol";

/**
 * @title EtherlinkFusionRouter
 * @dev Router contract that integrates 1inch Fusion+ with Etherlink bridge
 * Enables optimal cross-chain swaps between Ethereum and Etherlink L2
 */
contract EtherlinkFusionRouter is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // Events
    event FusionSwapInitiated(
        bytes32 indexed swapId,
        address indexed user,
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 fromChainId,
        uint256 toChainId,
        bytes32 fusionQuoteId
    );

    event FusionSwapCompleted(
        bytes32 indexed swapId,
        address indexed user,
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 fromChainId,
        uint256 toChainId
    );

    event FusionQuoteReceived(
        bytes32 indexed quoteId,
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 estimatedGas,
        uint256 priceImpact
    );

    // Structs
    struct FusionSwapRequest {
        address user;
        address fromToken;
        address toToken;
        uint256 fromAmount;
        uint256 toAmount;
        uint256 fromChainId;
        uint256 toChainId;
        bytes32 fusionQuoteId;
        uint256 timestamp;
        bool isCompleted;
        bool isCancelled;
        bytes32 bridgeId;
    }

    struct FusionQuote {
        bytes32 quoteId;
        address fromToken;
        address toToken;
        uint256 fromAmount;
        uint256 toAmount;
        uint256 estimatedGas;
        uint256 priceImpact;
        uint256 timestamp;
        bool isValid;
    }

    struct RouteConfig {
        bool isDirect;           // Direct swap or bridge required
        uint256 bridgeFee;       // Bridge fee in basis points
        uint256 maxSlippage;     // Maximum slippage tolerance
        uint256 minAmount;       // Minimum swap amount
        uint256 maxAmount;       // Maximum swap amount
    }

    // State variables
    mapping(bytes32 => FusionSwapRequest) public fusionSwaps;
    mapping(bytes32 => FusionQuote) public fusionQuotes;
    mapping(address => mapping(address => RouteConfig)) public routeConfigs;
    mapping(bytes32 => bool) public usedSignatures;

    // Contract references
    EtherlinkBridge public bridge;
    EtherlinkPriceOracle public priceOracle;
    address public fusionProtocol;

    // Constants
    uint256 public constant ETHERLINK_CHAIN_ID = 1284;
    uint256 public constant ETHEREUM_CHAIN_ID = 1;
    uint256 public constant MAX_SLIPPAGE = 500; // 5% max slippage
    uint256 public constant QUOTE_VALIDITY = 5 minutes;
    uint256 public constant SWAP_TIMEOUT = 1 hours;

    // Modifiers
    modifier onlyValidChain(uint256 chainId) {
        require(
            chainId == ETHERLINK_CHAIN_ID || chainId == ETHEREUM_CHAIN_ID,
            "Invalid chain"
        );
        _;
    }

    modifier onlyValidQuote(bytes32 quoteId) {
        FusionQuote memory quote = fusionQuotes[quoteId];
        require(quote.isValid, "Invalid quote");
        require(
            block.timestamp <= quote.timestamp + QUOTE_VALIDITY,
            "Quote expired"
        );
        _;
    }

    modifier onlyValidSignature(
        bytes32 swapId,
        bytes memory signature,
        uint256 timestamp
    ) {
        require(
            block.timestamp <= timestamp + 5 minutes,
            "Signature expired"
        );
        require(!usedSignatures[swapId], "Signature already used");
        
        bytes32 messageHash = keccak256(
            abi.encodePacked(swapId, timestamp)
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == owner(), "Invalid signature");
        
        usedSignatures[swapId] = true;
        _;
    }

    constructor(
        address _bridge,
        address _priceOracle,
        address _fusionProtocol
    ) {
        bridge = EtherlinkBridge(_bridge);
        priceOracle = EtherlinkPriceOracle(_priceOracle);
        fusionProtocol = _fusionProtocol;
        _setupDefaultRoutes();
    }

    /**
     * @dev Initiate a cross-chain swap using 1inch Fusion+
     * @param fromToken Source token address
     * @param toToken Target token address
     * @param fromAmount Amount to swap
     * @param toChainId Target chain ID
     * @param fusionQuoteId 1inch Fusion+ quote ID
     * @param expectedToAmount Expected amount to receive
     */
    function initiateFusionSwap(
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 toChainId,
        bytes32 fusionQuoteId,
        uint256 expectedToAmount
    ) external nonReentrant onlyValidChain(toChainId) {
        require(toChainId != block.chainid, "Cannot swap to same chain");
        require(fromAmount > 0, "Invalid amount");

        // Validate quote
        FusionQuote memory quote = fusionQuotes[fusionQuoteId];
        require(quote.isValid, "Invalid quote");
        require(
            block.timestamp <= quote.timestamp + QUOTE_VALIDITY,
            "Quote expired"
        );

        // Check slippage
        uint256 slippage = _calculateSlippage(quote.toAmount, expectedToAmount);
        RouteConfig memory config = routeConfigs[fromToken][toToken];
        require(slippage <= config.maxSlippage, "Slippage too high");

        // Generate swap ID
        bytes32 swapId = keccak256(
            abi.encodePacked(
                msg.sender,
                fromToken,
                toToken,
                fromAmount,
                toChainId,
                fusionQuoteId,
                block.timestamp,
                block.chainid
            )
        );

        // Create swap request
        FusionSwapRequest memory request = FusionSwapRequest({
            user: msg.sender,
            fromToken: fromToken,
            toToken: toToken,
            fromAmount: fromAmount,
            toAmount: quote.toAmount,
            fromChainId: block.chainid,
            toChainId: toChainId,
            fusionQuoteId: fusionQuoteId,
            timestamp: block.timestamp,
            isCompleted: false,
            isCancelled: false,
            bridgeId: bytes32(0)
        });

        fusionSwaps[swapId] = request;

        // Transfer tokens from user
        IERC20(fromToken).safeTransferFrom(msg.sender, address(this), fromAmount);

        // Determine if bridge is needed
        if (config.isDirect) {
            // Direct swap on current chain
            _executeDirectSwap(swapId, request);
        } else {
            // Cross-chain swap via bridge
            _initiateBridgeSwap(swapId, request);
        }

        emit FusionSwapInitiated(
            swapId,
            msg.sender,
            fromToken,
            toToken,
            fromAmount,
            quote.toAmount,
            block.chainid,
            toChainId,
            fusionQuoteId
        );
    }

    /**
     * @dev Complete cross-chain swap on target chain
     * @param swapId Swap request ID
     * @param signature Validator signature
     * @param timestamp Signature timestamp
     */
    function completeFusionSwap(
        bytes32 swapId,
        bytes memory signature,
        uint256 timestamp
    ) external nonReentrant onlyValidSignature(swapId, signature, timestamp) {
        FusionSwapRequest storage request = fusionSwaps[swapId];
        require(!request.isCompleted, "Swap already completed");
        require(!request.isCancelled, "Swap was cancelled");
        require(
            block.timestamp <= request.timestamp + SWAP_TIMEOUT,
            "Swap timeout"
        );

        request.isCompleted = true;

        // Transfer tokens to user
        IERC20(request.toToken).safeTransfer(request.user, request.toAmount);

        emit FusionSwapCompleted(
            swapId,
            request.user,
            request.fromToken,
            request.toToken,
            request.fromAmount,
            request.toAmount,
            request.fromChainId,
            request.toChainId
        );
    }

    /**
     * @dev Store 1inch Fusion+ quote
     * @param quoteId Quote ID
     * @param fromToken Source token
     * @param toToken Target token
     * @param fromAmount Source amount
     * @param toAmount Target amount
     * @param estimatedGas Estimated gas cost
     * @param priceImpact Price impact percentage
     */
    function storeFusionQuote(
        bytes32 quoteId,
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 estimatedGas,
        uint256 priceImpact
    ) external onlyOwner {
        fusionQuotes[quoteId] = FusionQuote({
            quoteId: quoteId,
            fromToken: fromToken,
            toToken: toToken,
            fromAmount: fromAmount,
            toAmount: toAmount,
            estimatedGas: estimatedGas,
            priceImpact: priceImpact,
            timestamp: block.timestamp,
            isValid: true
        });

        emit FusionQuoteReceived(
            quoteId,
            fromToken,
            toToken,
            fromAmount,
            toAmount,
            estimatedGas,
            priceImpact
        );
    }

    /**
     * @dev Cancel swap request
     * @param swapId Swap request ID
     */
    function cancelFusionSwap(bytes32 swapId) external nonReentrant {
        FusionSwapRequest storage request = fusionSwaps[swapId];
        require(!request.isCompleted, "Swap already completed");
        require(!request.isCancelled, "Swap already cancelled");
        require(
            msg.sender == request.user || 
            block.timestamp > request.timestamp + SWAP_TIMEOUT,
            "Cannot cancel swap"
        );

        request.isCancelled = true;

        // Refund tokens to user
        IERC20(request.fromToken).safeTransfer(request.user, request.fromAmount);
    }

    /**
     * @dev Configure route for token pair
     * @param fromToken Source token
     * @param toToken Target token
     * @param config Route configuration
     */
    function configureRoute(
        address fromToken,
        address toToken,
        RouteConfig memory config
    ) external onlyOwner {
        require(config.maxSlippage <= MAX_SLIPPAGE, "Slippage too high");
        routeConfigs[fromToken][toToken] = config;
    }

    /**
     * @dev Get optimal route for token pair
     * @param fromToken Source token
     * @param toToken Target token
     * @param amount Amount to swap
     * @return isDirect Whether direct swap is possible
     * @return estimatedGas Estimated gas cost
     * @return priceImpact Price impact
     */
    function getOptimalRoute(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view returns (
        bool isDirect,
        uint256 estimatedGas,
        uint256 priceImpact
    ) {
        RouteConfig memory config = routeConfigs[fromToken][toToken];
        isDirect = config.isDirect;
        
        // Get price data for calculation
        (uint256 fromPrice,, bool fromValid) = priceOracle.getPrice(fromToken, block.chainid);
        (uint256 toPrice,, bool toValid) = priceOracle.getPrice(toToken, block.chainid);
        
        if (fromValid && toValid) {
            // Calculate estimated gas based on route type
            estimatedGas = isDirect ? 150000 : 300000; // Bridge requires more gas
            
            // Calculate price impact (simplified)
            priceImpact = _calculatePriceImpact(fromPrice, toPrice, amount);
        }
    }

    /**
     * @dev Get swap request details
     * @param swapId Swap request ID
     * @return Swap request details
     */
    function getFusionSwap(bytes32 swapId) external view returns (FusionSwapRequest memory) {
        return fusionSwaps[swapId];
    }

    /**
     * @dev Get quote details
     * @param quoteId Quote ID
     * @return Quote details
     */
    function getFusionQuote(bytes32 quoteId) external view returns (FusionQuote memory) {
        return fusionQuotes[quoteId];
    }

    /**
     * @dev Execute direct swap on current chain
     * @param swapId Swap ID
     * @param request Swap request
     */
    function _executeDirectSwap(
        bytes32 swapId,
        FusionSwapRequest memory request
    ) internal {
        // In a real implementation, this would integrate with 1inch Fusion+ protocol
        // For now, we'll simulate the swap
        
        // Transfer tokens to user (simulated swap)
        IERC20(request.toToken).safeTransfer(request.user, request.toAmount);
        
        // Mark as completed
        fusionSwaps[swapId].isCompleted = true;
        
        emit FusionSwapCompleted(
            swapId,
            request.user,
            request.fromToken,
            request.toToken,
            request.fromAmount,
            request.toAmount,
            request.fromChainId,
            request.toChainId
        );
    }

    /**
     * @dev Initiate bridge swap for cross-chain operation
     * @param swapId Swap ID
     * @param request Swap request
     */
    function _initiateBridgeSwap(
        bytes32 swapId,
        FusionSwapRequest memory request
    ) internal {
        // Initiate bridge request
        bytes32 bridgeId = bridge.initiateBridge(
            request.fromToken,
            request.fromAmount,
            request.toChainId,
            request.fusionQuoteId
        );
        
        // Store bridge ID
        fusionSwaps[swapId].bridgeId = bridgeId;
    }

    /**
     * @dev Calculate slippage between expected and actual amounts
     * @param actualAmount Actual amount
     * @param expectedAmount Expected amount
     * @return Slippage percentage in basis points
     */
    function _calculateSlippage(
        uint256 actualAmount,
        uint256 expectedAmount
    ) internal pure returns (uint256) {
        if (expectedAmount == 0) return 0;
        
        uint256 difference = actualAmount > expectedAmount ?
            actualAmount - expectedAmount : expectedAmount - actualAmount;
        
        return (difference * 10000) / expectedAmount;
    }

    /**
     * @dev Calculate price impact
     * @param fromPrice Source token price
     * @param toPrice Target token price
     * @param amount Swap amount
     * @return Price impact percentage
     */
    function _calculatePriceImpact(
        uint256 fromPrice,
        uint256 toPrice,
        uint256 amount
    ) internal pure returns (uint256) {
        if (fromPrice == 0 || toPrice == 0) return 0;
        
        // Simplified price impact calculation
        uint256 value = (amount * fromPrice) / 1e8;
        if (value < 10000) return 50; // 0.5% for small trades
        if (value < 100000) return 30; // 0.3% for medium trades
        return 10; // 0.1% for large trades
    }

    /**
     * @dev Setup default route configurations
     */
    function _setupDefaultRoutes() private {
        // USDC routes
        routeConfigs[0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48][0xdAC17F958D2ee523a2206206994597C13D831ec7] = RouteConfig({
            isDirect: true,
            bridgeFee: 10,
            maxSlippage: 50,
            minAmount: 1e6,
            maxAmount: 1000000e6
        });

        // WETH routes
        routeConfigs[0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2][0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48] = RouteConfig({
            isDirect: false,
            bridgeFee: 15,
            maxSlippage: 100,
            minAmount: 1e16,
            maxAmount: 1000e18
        });

        // DAI routes
        routeConfigs[0x6B175474E89094C44Da98b954EedeAC495271d0F][0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48] = RouteConfig({
            isDirect: true,
            bridgeFee: 10,
            maxSlippage: 30,
            minAmount: 1e18,
            maxAmount: 1000000e18
        });
    }

    /**
     * @dev Emergency function to recover stuck tokens
     * @param token Token address
     * @param amount Amount to recover
     */
    function emergencyRecover(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /**
     * @dev Update contract references
     * @param _bridge New bridge address
     * @param _priceOracle New price oracle address
     * @param _fusionProtocol New fusion protocol address
     */
    function updateContracts(
        address _bridge,
        address _priceOracle,
        address _fusionProtocol
    ) external onlyOwner {
        bridge = EtherlinkBridge(_bridge);
        priceOracle = EtherlinkPriceOracle(_priceOracle);
        fusionProtocol = _fusionProtocol;
    }
} 