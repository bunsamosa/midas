// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title LimitOrderProtocol
 * @dev Limit Order Protocol for cross-chain swaps with partial fill support
 * Based on 1inch Fusion+ concepts
 */
contract LimitOrderProtocol is ReentrancyGuard {
    using ECDSA for bytes32;

    // Events
    event OrderCreated(
        bytes32 indexed orderId,
        address indexed maker,
        string fromChain,
        string toChain,
        string fromToken,
        string toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 filledAmount,
        uint256 remainingAmount,
        uint256 timelock
    );

    event OrderFilled(
        bytes32 indexed orderId,
        address indexed taker,
        uint256 filledAmount,
        uint256 remainingAmount
    );

    event OrderCancelled(
        bytes32 indexed orderId,
        address indexed maker
    );

    event OrderExpired(
        bytes32 indexed orderId
    );

    // Structs
    struct Order {
        address maker;
        string fromChain;
        string toChain;
        string fromToken;
        string toToken;
        uint256 fromAmount;
        uint256 toAmount;
        uint256 filledAmount;
        uint256 remainingAmount;
        uint256 timelock;
        bool isActive;
        bool isCancelled;
        uint256 createdAt;
    }

    // State variables
    mapping(bytes32 => Order) public orders;
    mapping(address => bytes32[]) public userOrders;
    mapping(bytes32 => mapping(address => uint256)) public orderFills; // orderId => taker => filled amount
    
    uint256 public constant MIN_ORDER_AMOUNT = 1e18; // 1 token minimum
    uint256 public constant MAX_ORDER_AMOUNT = 1000000e18; // 1M tokens maximum
    uint256 public constant MIN_TIMELOCK = 1 hours;
    uint256 public constant MAX_TIMELOCK = 30 days;
    
    uint256 public orderCounter;

    // Modifiers
    modifier onlyOrderMaker(bytes32 orderId) {
        require(orders[orderId].maker == msg.sender, "Only maker can call this");
        _;
    }

    modifier orderExists(bytes32 orderId) {
        require(orders[orderId].maker != address(0), "Order does not exist");
        _;
    }

    modifier orderActive(bytes32 orderId) {
        require(orders[orderId].isActive, "Order is not active");
        _;
    }

    modifier orderNotExpired(bytes32 orderId) {
        require(block.timestamp < orders[orderId].timelock, "Order has expired");
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount >= MIN_ORDER_AMOUNT, "Amount too small");
        require(amount <= MAX_ORDER_AMOUNT, "Amount too large");
        _;
    }

    /**
     * @dev Create a new limit order
     * @param fromChain Source chain identifier
     * @param toChain Target chain identifier
     * @param fromToken Source token symbol
     * @param toToken Target token symbol
     * @param fromAmount Total amount to swap from
     * @param toAmount Expected amount to receive
     * @param timelockDuration Duration for the timelock (in seconds)
     */
    function createOrder(
        string memory fromChain,
        string memory toChain,
        string memory fromToken,
        string memory toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 timelockDuration
    ) external validAmount(fromAmount) nonReentrant returns (bytes32) {
        require(bytes(fromChain).length > 0, "Invalid from chain");
        require(bytes(toChain).length > 0, "Invalid to chain");
        require(bytes(fromToken).length > 0, "Invalid from token");
        require(bytes(toToken).length > 0, "Invalid to token");
        require(toAmount > 0, "Invalid to amount");
        require(timelockDuration >= MIN_TIMELOCK, "Timelock too short");
        require(timelockDuration <= MAX_TIMELOCK, "Timelock too long");

        // Generate unique order ID
        bytes32 orderId = keccak256(
            abi.encodePacked(
                msg.sender,
                fromChain,
                toChain,
                fromToken,
                toToken,
                fromAmount,
                toAmount,
                block.timestamp,
                orderCounter
            )
        );

        require(orders[orderId].maker == address(0), "Order ID collision");

        // Calculate timelock
        uint256 timelock = block.timestamp + timelockDuration;

        // Create order
        orders[orderId] = Order({
            maker: msg.sender,
            fromChain: fromChain,
            toChain: toChain,
            fromToken: fromToken,
            toToken: toToken,
            fromAmount: fromAmount,
            toAmount: toAmount,
            filledAmount: 0,
            remainingAmount: fromAmount,
            timelock: timelock,
            isActive: true,
            isCancelled: false,
            createdAt: block.timestamp
        });

        userOrders[msg.sender].push(orderId);
        orderCounter++;

        emit OrderCreated(
            orderId,
            msg.sender,
            fromChain,
            toChain,
            fromToken,
            toToken,
            fromAmount,
            toAmount,
            0, // filledAmount
            fromAmount, // remainingAmount
            timelock
        );

        return orderId;
    }

    /**
     * @dev Fill an order partially or completely
     * @param orderId The order ID to fill
     * @param fillAmount Amount to fill
     */
    function fillOrder(
        bytes32 orderId,
        uint256 fillAmount
    ) external orderExists(orderId) orderActive(orderId) orderNotExpired(orderId) nonReentrant {
        Order storage order = orders[orderId];
        
        require(fillAmount > 0, "Fill amount must be positive");
        require(fillAmount <= order.remainingAmount, "Fill amount exceeds remaining amount");
        require(msg.sender != order.maker, "Maker cannot fill their own order");

        // Update order state
        order.filledAmount += fillAmount;
        order.remainingAmount -= fillAmount;

        // Update taker's fill amount
        orderFills[orderId][msg.sender] += fillAmount;

        // Check if order is completely filled
        if (order.remainingAmount == 0) {
            order.isActive = false;
        }

        emit OrderFilled(orderId, msg.sender, fillAmount, order.remainingAmount);
    }

    /**
     * @dev Cancel an order (only maker can cancel)
     * @param orderId The order ID to cancel
     */
    function cancelOrder(
        bytes32 orderId
    ) external onlyOrderMaker(orderId) orderActive(orderId) {
        Order storage order = orders[orderId];
        
        order.isActive = false;
        order.isCancelled = true;

        emit OrderCancelled(orderId, msg.sender);
    }

    /**
     * @dev Mark an order as expired
     * @param orderId The order ID to mark as expired
     */
    function markOrderExpired(
        bytes32 orderId
    ) external orderExists(orderId) orderActive(orderId) {
        Order storage order = orders[orderId];
        
        if (block.timestamp >= order.timelock) {
            order.isActive = false;
            emit OrderExpired(orderId);
        }
    }

    /**
     * @dev Get order details
     * @param orderId The order ID
     * @return Order details
     */
    function getOrder(bytes32 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    /**
     * @dev Get all orders for a user
     * @param user The user address
     * @return Array of order IDs
     */
    function getUserOrders(address user) external view returns (bytes32[] memory) {
        return userOrders[user];
    }

    /**
     * @dev Get fill amount for a specific taker
     * @param orderId The order ID
     * @param taker The taker address
     * @return Fill amount
     */
    function getTakerFillAmount(bytes32 orderId, address taker) external view returns (uint256) {
        return orderFills[orderId][taker];
    }

    /**
     * @dev Get order status
     * @param orderId The order ID
     * @return status string
     */
    function getOrderStatus(bytes32 orderId) external view returns (string memory) {
        Order storage order = orders[orderId];
        
        if (order.maker == address(0)) {
            return "NONEXISTENT";
        }
        
        if (order.isCancelled) {
            return "CANCELLED";
        }
        
        if (order.isActive == false) {
            return "FILLED";
        }
        
        if (block.timestamp >= order.timelock) {
            return "EXPIRED";
        }
        
        return "ACTIVE";
    }

    /**
     * @dev Get order fill percentage
     * @param orderId The order ID
     * @return fill percentage (0-100)
     */
    function getOrderFillPercentage(bytes32 orderId) external view returns (uint256) {
        Order storage order = orders[orderId];
        
        if (order.maker == address(0) || order.fromAmount == 0) {
            return 0;
        }
        
        return (order.filledAmount * 100) / order.fromAmount;
    }

    /**
     * @dev Get available orders for a specific token pair
     * @param fromToken Source token
     * @param toToken Target token
     * @return Array of active order IDs
     */
    function getAvailableOrders(
        string memory fromToken,
        string memory toToken
    ) external view returns (bytes32[] memory) {
        // This is a simplified implementation
        // In a real implementation, you would maintain an index of orders by token pair
        bytes32[] memory availableOrders = new bytes32[](0);
        return availableOrders;
    }
} 