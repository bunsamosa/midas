// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title EtherlinkPriceOracle
 * @dev Price oracle for Etherlink tokens with 1inch Fusion+ integration
 * Provides price feeds for cross-chain swaps and bridge operations
 */
contract EtherlinkPriceOracle is Ownable, Pausable {
    using SafeMath for uint256;

    // Events
    event PriceUpdated(
        address indexed token,
        uint256 price,
        uint256 timestamp,
        uint256 chainId
    );

    event OracleAdded(
        address indexed token,
        address indexed oracle,
        uint256 chainId
    );

    event OracleRemoved(
        address indexed token,
        uint256 chainId
    );

    // Structs
    struct PriceData {
        uint256 price;        // Price in USD (8 decimals)
        uint256 timestamp;    // Last update timestamp
        uint256 chainId;      // Chain ID where price was updated
        bool isValid;         // Whether the price is valid
    }

    struct OracleConfig {
        address oracle;       // Oracle address
        uint256 heartbeat;    // Maximum time between updates
        bool isActive;        // Whether oracle is active
        uint256 decimals;     // Price decimals
    }

    // State variables
    mapping(address => mapping(uint256 => PriceData)) public prices;
    mapping(address => mapping(uint256 => OracleConfig)) public oracles;
    mapping(uint256 => bool) public supportedChains;
    
    // Constants
    uint256 public constant ETHERLINK_CHAIN_ID = 1284;
    uint256 public constant ETHEREUM_CHAIN_ID = 1;
    uint256 public constant PRICE_DECIMALS = 8;
    uint256 public constant MAX_PRICE_DEVIATION = 50; // 50% max deviation
    uint256 public constant MIN_HEARTBEAT = 1 hours;
    uint256 public constant MAX_HEARTBEAT = 24 hours;

    // Modifiers
    modifier onlyValidChain(uint256 chainId) {
        require(supportedChains[chainId], "Chain not supported");
        _;
    }

    modifier onlyValidOracle(address token, uint256 chainId) {
        require(oracles[token][chainId].isActive, "Oracle not active");
        _;
    }

    modifier onlyOracle(address token, uint256 chainId) {
        require(msg.sender == oracles[token][chainId].oracle, "Only oracle can call");
        _;
    }

    constructor() {
        supportedChains[ETHERLINK_CHAIN_ID] = true;
        supportedChains[ETHEREUM_CHAIN_ID] = true;
    }

    /**
     * @dev Update price for a token (called by oracle)
     * @param token Token address
     * @param price New price in USD (8 decimals)
     * @param chainId Chain ID
     */
    function updatePrice(
        address token,
        uint256 price,
        uint256 chainId
    ) external onlyOracle(token, chainId) onlyValidChain(chainId) {
        require(price > 0, "Price must be positive");
        
        PriceData storage currentPrice = prices[token][chainId];
        
        // Check price deviation if price exists
        if (currentPrice.isValid && currentPrice.price > 0) {
            uint256 deviation = _calculateDeviation(currentPrice.price, price);
            require(deviation <= MAX_PRICE_DEVIATION, "Price deviation too high");
        }

        // Update price data
        currentPrice.price = price;
        currentPrice.timestamp = block.timestamp;
        currentPrice.chainId = chainId;
        currentPrice.isValid = true;

        emit PriceUpdated(token, price, block.timestamp, chainId);
    }

    /**
     * @dev Get current price for a token
     * @param token Token address
     * @param chainId Chain ID
     * @return price Current price in USD
     * @return timestamp Last update timestamp
     * @return isValid Whether price is valid
     */
    function getPrice(
        address token,
        uint256 chainId
    ) external view onlyValidChain(chainId) returns (
        uint256 price,
        uint256 timestamp,
        bool isValid
    ) {
        PriceData memory priceData = prices[token][chainId];
        
        // Check if price is stale
        if (priceData.isValid) {
            uint256 heartbeat = oracles[token][chainId].heartbeat;
            if (block.timestamp > priceData.timestamp + heartbeat) {
                isValid = false;
            } else {
                price = priceData.price;
                timestamp = priceData.timestamp;
                isValid = true;
            }
        } else {
            isValid = false;
        }
    }

    /**
     * @dev Get price for 1inch Fusion+ integration
     * @param token Token address
     * @param chainId Chain ID
     * @return price Current price in USD (8 decimals)
     */
    function getFusionPrice(
        address token,
        uint256 chainId
    ) external view onlyValidChain(chainId) returns (uint256 price) {
        PriceData memory priceData = prices[token][chainId];
        require(priceData.isValid, "Price not available");
        
        uint256 heartbeat = oracles[token][chainId].heartbeat;
        require(
            block.timestamp <= priceData.timestamp + heartbeat,
            "Price is stale"
        );
        
        return priceData.price;
    }

    /**
     * @dev Get cross-chain price comparison for bridge operations
     * @param token Token address
     * @param sourceChainId Source chain ID
     * @param targetChainId Target chain ID
     * @return sourcePrice Price on source chain
     * @return targetPrice Price on target chain
     * @return priceDifference Price difference percentage
     */
    function getCrossChainPrice(
        address token,
        uint256 sourceChainId,
        uint256 targetChainId
    ) external view returns (
        uint256 sourcePrice,
        uint256 targetPrice,
        uint256 priceDifference
    ) {
        require(sourceChainId != targetChainId, "Same chain");
        require(supportedChains[sourceChainId], "Source chain not supported");
        require(supportedChains[targetChainId], "Target chain not supported");

        PriceData memory sourcePriceData = prices[token][sourceChainId];
        PriceData memory targetPriceData = prices[token][targetChainId];

        require(sourcePriceData.isValid, "Source price not available");
        require(targetPriceData.isValid, "Target price not available");

        sourcePrice = sourcePriceData.price;
        targetPrice = targetPriceData.price;

        if (sourcePrice > 0) {
            priceDifference = _calculateDeviation(sourcePrice, targetPrice);
        }
    }

    /**
     * @dev Add oracle for a token
     * @param token Token address
     * @param oracle Oracle address
     * @param chainId Chain ID
     * @param heartbeat Heartbeat interval
     */
    function addOracle(
        address token,
        address oracle,
        uint256 chainId,
        uint256 heartbeat
    ) external onlyOwner onlyValidChain(chainId) {
        require(oracle != address(0), "Invalid oracle address");
        require(heartbeat >= MIN_HEARTBEAT, "Heartbeat too low");
        require(heartbeat <= MAX_HEARTBEAT, "Heartbeat too high");

        oracles[token][chainId] = OracleConfig({
            oracle: oracle,
            heartbeat: heartbeat,
            isActive: true,
            decimals: PRICE_DECIMALS
        });

        emit OracleAdded(token, oracle, chainId);
    }

    /**
     * @dev Remove oracle for a token
     * @param token Token address
     * @param chainId Chain ID
     */
    function removeOracle(
        address token,
        uint256 chainId
    ) external onlyOwner onlyValidChain(chainId) {
        oracles[token][chainId].isActive = false;
        emit OracleRemoved(token, chainId);
    }

    /**
     * @dev Add supported chain
     * @param chainId Chain ID
     */
    function addSupportedChain(uint256 chainId) external onlyOwner {
        supportedChains[chainId] = true;
    }

    /**
     * @dev Remove supported chain
     * @param chainId Chain ID
     */
    function removeSupportedChain(uint256 chainId) external onlyOwner {
        require(chainId != ETHERLINK_CHAIN_ID, "Cannot remove Etherlink");
        require(chainId != ETHEREUM_CHAIN_ID, "Cannot remove Ethereum");
        supportedChains[chainId] = false;
    }

    /**
     * @dev Pause oracle operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause oracle operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get oracle configuration
     * @param token Token address
     * @param chainId Chain ID
     * @return Oracle configuration
     */
    function getOracleConfig(
        address token,
        uint256 chainId
    ) external view returns (OracleConfig memory) {
        return oracles[token][chainId];
    }

    /**
     * @dev Check if price is valid and not stale
     * @param token Token address
     * @param chainId Chain ID
     * @return True if price is valid
     */
    function isPriceValid(
        address token,
        uint256 chainId
    ) external view returns (bool) {
        PriceData memory priceData = prices[token][chainId];
        if (!priceData.isValid) return false;
        
        uint256 heartbeat = oracles[token][chainId].heartbeat;
        return block.timestamp <= priceData.timestamp + heartbeat;
    }

    /**
     * @dev Calculate price deviation between two prices
     * @param price1 First price
     * @param price2 Second price
     * @return Deviation percentage (basis points)
     */
    function _calculateDeviation(
        uint256 price1,
        uint256 price2
    ) internal pure returns (uint256) {
        if (price1 == 0) return 0;
        
        uint256 difference = price1 > price2 ? 
            price1.sub(price2) : price2.sub(price1);
        
        return difference.mul(10000).div(price1);
    }

    /**
     * @dev Get price for multiple tokens (batch operation)
     * @param tokens Array of token addresses
     * @param chainId Chain ID
     * @return prices Array of prices
     * @return timestamps Array of timestamps
     * @return validities Array of validity flags
     */
    function getBatchPrices(
        address[] calldata tokens,
        uint256 chainId
    ) external view onlyValidChain(chainId) returns (
        uint256[] memory prices,
        uint256[] memory timestamps,
        bool[] memory validities
    ) {
        uint256 length = tokens.length;
        prices = new uint256[](length);
        timestamps = new uint256[](length);
        validities = new bool[](length);

        for (uint256 i = 0; i < length; i++) {
            PriceData memory priceData = prices[tokens[i]][chainId];
            
            if (priceData.isValid) {
                uint256 heartbeat = oracles[tokens[i]][chainId].heartbeat;
                if (block.timestamp <= priceData.timestamp + heartbeat) {
                    prices[i] = priceData.price;
                    timestamps[i] = priceData.timestamp;
                    validities[i] = true;
                }
            }
        }
    }

    /**
     * @dev Emergency price update (only owner)
     * @param token Token address
     * @param price New price
     * @param chainId Chain ID
     */
    function emergencyUpdatePrice(
        address token,
        uint256 price,
        uint256 chainId
    ) external onlyOwner onlyValidChain(chainId) {
        require(price > 0, "Price must be positive");
        
        prices[token][chainId] = PriceData({
            price: price,
            timestamp: block.timestamp,
            chainId: chainId,
            isValid: true
        });

        emit PriceUpdated(token, price, block.timestamp, chainId);
    }
} 