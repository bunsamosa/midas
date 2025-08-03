// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title EtherlinkBridge
 * @dev Bridge contract for cross-chain swaps between Ethereum and Etherlink L2
 * Integrates with 1inch Fusion+ protocol for optimal routing
 */
contract EtherlinkBridge is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // Events
    event BridgeInitiated(
        bytes32 indexed bridgeId,
        address indexed user,
        address token,
        uint256 amount,
        uint256 targetChainId,
        uint256 timestamp
    );

    event BridgeCompleted(
        bytes32 indexed bridgeId,
        address indexed user,
        address token,
        uint256 amount,
        uint256 sourceChainId,
        uint256 timestamp
    );

    event LiquidityAdded(
        address indexed token,
        uint256 amount,
        address indexed provider
    );

    event LiquidityRemoved(
        address indexed token,
        uint256 amount,
        address indexed provider
    );

    // Structs
    struct BridgeRequest {
        address user;
        address token;
        uint256 amount;
        uint256 targetChainId;
        uint256 sourceChainId;
        uint256 timestamp;
        bool isCompleted;
        bool isCancelled;
        bytes32 fusionQuoteId; // 1inch Fusion+ quote ID
    }

    struct TokenConfig {
        bool isSupported;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 bridgeFee; // in basis points (1 = 0.01%)
        uint256 dailyLimit;
        uint256 dailyUsed;
        uint256 lastResetTime;
    }

    // State variables
    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    mapping(address => TokenConfig) public supportedTokens;
    mapping(address => uint256) public liquidityPool;
    mapping(address => uint256) public userBalances;
    mapping(bytes32 => bool) public usedSignatures;

    // Constants
    uint256 public constant ETHERLINK_CHAIN_ID = 1284; // Etherlink testnet
    uint256 public constant ETHEREUM_CHAIN_ID = 1;
    uint256 public constant MAX_BRIDGE_FEE = 100; // 1% max fee
    uint256 public constant BRIDGE_TIMEOUT = 1 hours;
    uint256 public constant SIGNATURE_VALIDITY = 5 minutes;

    // 1inch Fusion+ integration
    address public fusionRouter;
    mapping(bytes32 => bool) public fusionQuotes;

    // Modifiers
    modifier onlyValidToken(address token) {
        require(supportedTokens[token].isSupported, "Token not supported");
        _;
    }

    modifier onlyValidAmount(address token, uint256 amount) {
        TokenConfig memory config = supportedTokens[token];
        require(amount >= config.minAmount, "Amount too low");
        require(amount <= config.maxAmount, "Amount too high");
        require(
            config.dailyUsed + amount <= config.dailyLimit,
            "Daily limit exceeded"
        );
        _;
    }

    modifier onlyValidSignature(
        bytes32 bridgeId,
        bytes memory signature,
        uint256 timestamp
    ) {
        require(
            block.timestamp <= timestamp + SIGNATURE_VALIDITY,
            "Signature expired"
        );
        require(!usedSignatures[bridgeId], "Signature already used");
        
        bytes32 messageHash = keccak256(
            abi.encodePacked(bridgeId, timestamp)
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == owner(), "Invalid signature");
        
        usedSignatures[bridgeId] = true;
        _;
    }

    constructor(address _fusionRouter) {
        fusionRouter = _fusionRouter;
        _setupDefaultTokens();
    }

    /**
     * @dev Initialize a bridge request with 1inch Fusion+ integration
     * @param token Token to bridge
     * @param amount Amount to bridge
     * @param targetChainId Target chain ID (Etherlink or Ethereum)
     * @param fusionQuoteId 1inch Fusion+ quote ID for optimal routing
     */
    function initiateBridge(
        address token,
        uint256 amount,
        uint256 targetChainId,
        bytes32 fusionQuoteId
    ) external nonReentrant onlyValidToken(token) onlyValidAmount(token, amount) {
        require(
            targetChainId == ETHERLINK_CHAIN_ID || targetChainId == ETHEREUM_CHAIN_ID,
            "Invalid target chain"
        );
        require(targetChainId != block.chainid, "Cannot bridge to same chain");

        // Generate bridge ID
        bytes32 bridgeId = keccak256(
            abi.encodePacked(
                msg.sender,
                token,
                amount,
                targetChainId,
                block.timestamp,
                block.chainid
            )
        );

        // Create bridge request
        BridgeRequest memory request = BridgeRequest({
            user: msg.sender,
            token: token,
            amount: amount,
            targetChainId: targetChainId,
            sourceChainId: block.chainid,
            timestamp: block.timestamp,
            isCompleted: false,
            isCancelled: false,
            fusionQuoteId: fusionQuoteId
        });

        bridgeRequests[bridgeId] = request;
        fusionQuotes[fusionQuoteId] = true;

        // Update daily usage
        supportedTokens[token].dailyUsed += amount;

        // Transfer tokens from user to bridge
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        liquidityPool[token] += amount;

        emit BridgeInitiated(
            bridgeId,
            msg.sender,
            token,
            amount,
            targetChainId,
            block.timestamp
        );
    }

    /**
     * @dev Complete bridge request on target chain
     * @param bridgeId Bridge request ID
     * @param signature Validator signature
     * @param timestamp Signature timestamp
     */
    function completeBridge(
        bytes32 bridgeId,
        bytes memory signature,
        uint256 timestamp
    ) external nonReentrant onlyValidSignature(bridgeId, signature, timestamp) {
        BridgeRequest storage request = bridgeRequests[bridgeId];
        require(!request.isCompleted, "Bridge already completed");
        require(!request.isCancelled, "Bridge was cancelled");
        require(
            block.timestamp <= request.timestamp + BRIDGE_TIMEOUT,
            "Bridge timeout"
        );

        request.isCompleted = true;

        // Calculate bridge fee
        uint256 fee = (request.amount * supportedTokens[request.token].bridgeFee) / 10000;
        uint256 amountAfterFee = request.amount - fee;

        // Transfer tokens to user
        IERC20(request.token).safeTransfer(request.user, amountAfterFee);
        liquidityPool[request.token] -= request.amount;

        // Update user balance for fee collection
        userBalances[owner()] += fee;

        emit BridgeCompleted(
            bridgeId,
            request.user,
            request.token,
            amountAfterFee,
            request.sourceChainId,
            block.timestamp
        );
    }

    /**
     * @dev Cancel bridge request (only by user or after timeout)
     * @param bridgeId Bridge request ID
     */
    function cancelBridge(bytes32 bridgeId) external nonReentrant {
        BridgeRequest storage request = bridgeRequests[bridgeId];
        require(!request.isCompleted, "Bridge already completed");
        require(!request.isCancelled, "Bridge already cancelled");
        require(
            msg.sender == request.user || 
            block.timestamp > request.timestamp + BRIDGE_TIMEOUT,
            "Cannot cancel bridge"
        );

        request.isCancelled = true;

        // Refund tokens to user
        IERC20(request.token).safeTransfer(request.user, request.amount);
        liquidityPool[request.token] -= request.amount;

        // Reset daily usage
        supportedTokens[request.token].dailyUsed -= request.amount;
    }

    /**
     * @dev Add liquidity to bridge pool
     * @param token Token to add liquidity for
     * @param amount Amount to add
     */
    function addLiquidity(
        address token,
        uint256 amount
    ) external nonReentrant onlyValidToken(token) {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        liquidityPool[token] += amount;

        emit LiquidityAdded(token, amount, msg.sender);
    }

    /**
     * @dev Remove liquidity from bridge pool (only owner)
     * @param token Token to remove liquidity from
     * @param amount Amount to remove
     */
    function removeLiquidity(
        address token,
        uint256 amount
    ) external nonReentrant onlyOwner {
        require(liquidityPool[token] >= amount, "Insufficient liquidity");
        liquidityPool[token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);

        emit LiquidityRemoved(token, amount, msg.sender);
    }

    /**
     * @dev Configure supported token
     * @param token Token address
     * @param config Token configuration
     */
    function configureToken(
        address token,
        TokenConfig memory config
    ) external onlyOwner {
        require(config.bridgeFee <= MAX_BRIDGE_FEE, "Bridge fee too high");
        supportedTokens[token] = config;
    }

    /**
     * @dev Update 1inch Fusion+ router address
     * @param _fusionRouter New router address
     */
    function updateFusionRouter(address _fusionRouter) external onlyOwner {
        fusionRouter = _fusionRouter;
    }

    /**
     * @dev Withdraw collected fees
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     */
    function withdrawFees(address token, uint256 amount) external onlyOwner {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        userBalances[msg.sender] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /**
     * @dev Reset daily limits (called by owner or automatically)
     */
    function resetDailyLimits() external {
        address[] memory tokens = getSupportedTokens();
        for (uint256 i = 0; i < tokens.length; i++) {
            TokenConfig storage config = supportedTokens[tokens[i]];
            if (block.timestamp >= config.lastResetTime + 1 days) {
                config.dailyUsed = 0;
                config.lastResetTime = block.timestamp;
            }
        }
    }

    /**
     * @dev Get bridge request details
     * @param bridgeId Bridge request ID
     * @return Bridge request details
     */
    function getBridgeRequest(bytes32 bridgeId) external view returns (BridgeRequest memory) {
        return bridgeRequests[bridgeId];
    }

    /**
     * @dev Get supported tokens list
     * @return Array of supported token addresses
     */
    function getSupportedTokens() public view returns (address[] memory) {
        // This is a simplified version - in production, you'd maintain a separate array
        // For now, we'll return common tokens
        address[] memory tokens = new address[](5);
        tokens[0] = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        tokens[1] = 0xdAC17F958D2ee523a2206206994597C13D831ec7; // USDT
        tokens[2] = 0x6B175474E89094C44Da98b954EedeAC495271d0F; // DAI
        tokens[3] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // WETH
        tokens[4] = 0x2260FAC54E5542a7734fEe71FfE62b7Ecd13d67E; // WBTC
        return tokens;
    }

    /**
     * @dev Get bridge pool liquidity
     * @param token Token address
     * @return Liquidity amount
     */
    function getLiquidity(address token) external view returns (uint256) {
        return liquidityPool[token];
    }

    /**
     * @dev Check if bridge request is valid for completion
     * @param bridgeId Bridge request ID
     * @return True if valid for completion
     */
    function isValidForCompletion(bytes32 bridgeId) external view returns (bool) {
        BridgeRequest memory request = bridgeRequests[bridgeId];
        return (
            !request.isCompleted &&
            !request.isCancelled &&
            block.timestamp <= request.timestamp + BRIDGE_TIMEOUT
        );
    }

    /**
     * @dev Setup default supported tokens
     */
    function _setupDefaultTokens() private {
        // USDC
        supportedTokens[0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48] = TokenConfig({
            isSupported: true,
            minAmount: 1e6, // 1 USDC
            maxAmount: 1000000e6, // 1M USDC
            bridgeFee: 10, // 0.1%
            dailyLimit: 10000000e6, // 10M USDC
            dailyUsed: 0,
            lastResetTime: block.timestamp
        });

        // USDT
        supportedTokens[0xdAC17F958D2ee523a2206206994597C13D831ec7] = TokenConfig({
            isSupported: true,
            minAmount: 1e6, // 1 USDT
            maxAmount: 1000000e6, // 1M USDT
            bridgeFee: 10, // 0.1%
            dailyLimit: 10000000e6, // 10M USDT
            dailyUsed: 0,
            lastResetTime: block.timestamp
        });

        // DAI
        supportedTokens[0x6B175474E89094C44Da98b954EedeAC495271d0F] = TokenConfig({
            isSupported: true,
            minAmount: 1e18, // 1 DAI
            maxAmount: 1000000e18, // 1M DAI
            bridgeFee: 10, // 0.1%
            dailyLimit: 10000000e18, // 10M DAI
            dailyUsed: 0,
            lastResetTime: block.timestamp
        });

        // WETH
        supportedTokens[0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2] = TokenConfig({
            isSupported: true,
            minAmount: 1e16, // 0.01 WETH
            maxAmount: 1000e18, // 1000 WETH
            bridgeFee: 15, // 0.15%
            dailyLimit: 10000e18, // 10K WETH
            dailyUsed: 0,
            lastResetTime: block.timestamp
        });
    }
} 