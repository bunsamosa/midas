// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title CrossChainSwap
 * @dev Cross-chain swap contract with hashlock and timelock functionality
 * Supports bidirectional swaps between Ethereum and other EVM chains
 */
contract CrossChainSwap is ReentrancyGuard {
    using ECDSA for bytes32;

    // Events
    event SwapInitiated(
        bytes32 indexed swapId,
        address indexed initiator,
        address indexed recipient,
        string fromChain,
        string toChain,
        string fromToken,
        string toToken,
        uint256 fromAmount,
        uint256 toAmount,
        bytes32 hashlock,
        uint256 timelock
    );

    event HashlockCreated(
        bytes32 indexed swapId,
        bytes32 hashlock,
        uint256 timelock
    );

    event SwapCompleted(
        bytes32 indexed swapId,
        bytes32 preimage
    );

    event SwapExpired(
        bytes32 indexed swapId
    );

    event SwapRefunded(
        bytes32 indexed swapId,
        address indexed recipient
    );

    // Structs
    struct Swap {
        address initiator;
        address recipient;
        string fromChain;
        string toChain;
        string fromToken;
        string toToken;
        uint256 fromAmount;
        uint256 toAmount;
        bytes32 hashlock;
        uint256 timelock;
        bool isCompleted;
        bool isExpired;
        bool isRefunded;
        uint256 createdAt;
    }

    // State variables
    mapping(bytes32 => Swap) public swaps;
    mapping(bytes32 => bool) public usedHashlocks;
    mapping(address => bytes32[]) public userSwaps;
    
    uint256 public constant MIN_TIMELOCK = 1 hours;
    uint256 public constant MAX_TIMELOCK = 7 days;
    uint256 public swapCounter;

    // Modifiers
    modifier onlySwapInitiator(bytes32 swapId) {
        require(swaps[swapId].initiator == msg.sender, "Only initiator can call this");
        _;
    }

    modifier swapExists(bytes32 swapId) {
        require(swaps[swapId].initiator != address(0), "Swap does not exist");
        _;
    }

    modifier swapNotCompleted(bytes32 swapId) {
        require(!swaps[swapId].isCompleted, "Swap already completed");
        _;
    }

    modifier swapNotExpired(bytes32 swapId) {
        require(block.timestamp < swaps[swapId].timelock, "Swap has expired");
        _;
    }

    modifier swapExpired(bytes32 swapId) {
        require(block.timestamp >= swaps[swapId].timelock, "Swap has not expired yet");
        _;
    }

    /**
     * @dev Initiate a cross-chain swap
     * @param recipient The recipient address on the target chain
     * @param fromChain Source chain identifier
     * @param toChain Target chain identifier
     * @param fromToken Source token symbol
     * @param toToken Target token symbol
     * @param fromAmount Amount to swap from
     * @param toAmount Expected amount to receive
     * @param timelockDuration Duration for the timelock (in seconds)
     */
    function initiateSwap(
        address recipient,
        string memory fromChain,
        string memory toChain,
        string memory fromToken,
        string memory toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 timelockDuration
    ) external payable nonReentrant returns (bytes32) {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(fromChain).length > 0, "Invalid from chain");
        require(bytes(toChain).length > 0, "Invalid to chain");
        require(bytes(fromToken).length > 0, "Invalid from token");
        require(bytes(toToken).length > 0, "Invalid to token");
        require(fromAmount > 0, "Invalid from amount");
        require(toAmount > 0, "Invalid to amount");
        require(timelockDuration >= MIN_TIMELOCK, "Timelock too short");
        require(timelockDuration <= MAX_TIMELOCK, "Timelock too long");

        // Generate unique swap ID
        bytes32 swapId = keccak256(
            abi.encodePacked(
                msg.sender,
                recipient,
                fromChain,
                toChain,
                fromToken,
                toToken,
                fromAmount,
                toAmount,
                block.timestamp,
                swapCounter
            )
        );

        require(swaps[swapId].initiator == address(0), "Swap ID collision");

        // Generate hashlock (in real implementation, this would be provided by the user)
        bytes32 hashlock = keccak256(
            abi.encodePacked(
                swapId,
                block.timestamp,
                block.difficulty
            )
        );

        // Calculate timelock
        uint256 timelock = block.timestamp + timelockDuration;

        // Create swap
        swaps[swapId] = Swap({
            initiator: msg.sender,
            recipient: recipient,
            fromChain: fromChain,
            toChain: toChain,
            fromToken: fromToken,
            toToken: toToken,
            fromAmount: fromAmount,
            toAmount: toAmount,
            hashlock: hashlock,
            timelock: timelock,
            isCompleted: false,
            isExpired: false,
            isRefunded: false,
            createdAt: block.timestamp
        });

        usedHashlocks[hashlock] = true;
        userSwaps[msg.sender].push(swapId);
        swapCounter++;

        emit SwapInitiated(
            swapId,
            msg.sender,
            recipient,
            fromChain,
            toChain,
            fromToken,
            toToken,
            fromAmount,
            toAmount,
            hashlock,
            timelock
        );

        emit HashlockCreated(swapId, hashlock, timelock);

        return swapId;
    }

    /**
     * @dev Complete a swap using the preimage
     * @param swapId The swap ID to complete
     * @param preimage The preimage that matches the hashlock
     */
    function completeSwap(
        bytes32 swapId,
        bytes32 preimage
    ) external swapExists(swapId) swapNotCompleted(swapId) swapNotExpired(swapId) nonReentrancy {
        Swap storage swap = swaps[swapId];
        
        // Verify the preimage matches the hashlock
        require(keccak256(abi.encodePacked(preimage)) == swap.hashlock, "Invalid preimage");
        
        swap.isCompleted = true;
        
        emit SwapCompleted(swapId, preimage);
    }

    /**
     * @dev Refund a swap after it has expired
     * @param swapId The swap ID to refund
     */
    function refundSwap(
        bytes32 swapId
    ) external swapExists(swapId) swapNotCompleted(swapId) swapExpired(swapId) nonReentrancy {
        Swap storage swap = swaps[swapId];
        
        require(msg.sender == swap.initiator || msg.sender == swap.recipient, "Not authorized");
        require(!swap.isRefunded, "Already refunded");
        
        swap.isRefunded = true;
        swap.isExpired = true;
        
        emit SwapRefunded(swapId, swap.initiator);
    }

    /**
     * @dev Mark a swap as expired
     * @param swapId The swap ID to mark as expired
     */
    function markSwapExpired(
        bytes32 swapId
    ) external swapExists(swapId) swapNotCompleted(swapId) swapExpired(swapId) {
        Swap storage swap = swaps[swapId];
        
        if (!swap.isExpired) {
            swap.isExpired = true;
            emit SwapExpired(swapId);
        }
    }

    /**
     * @dev Get swap details
     * @param swapId The swap ID
     * @return Swap details
     */
    function getSwap(bytes32 swapId) external view returns (Swap memory) {
        return swaps[swapId];
    }

    /**
     * @dev Get all swaps for a user
     * @param user The user address
     * @return Array of swap IDs
     */
    function getUserSwaps(address user) external view returns (bytes32[] memory) {
        return userSwaps[user];
    }

    /**
     * @dev Check if a hashlock is used
     * @param hashlock The hashlock to check
     * @return True if used
     */
    function isHashlockUsed(bytes32 hashlock) external view returns (bool) {
        return usedHashlocks[hashlock];
    }

    /**
     * @dev Get swap status
     * @param swapId The swap ID
     * @return status string
     */
    function getSwapStatus(bytes32 swapId) external view returns (string memory) {
        Swap storage swap = swaps[swapId];
        
        if (swap.initiator == address(0)) {
            return "NONEXISTENT";
        }
        
        if (swap.isCompleted) {
            return "COMPLETED";
        }
        
        if (swap.isRefunded) {
            return "REFUNDED";
        }
        
        if (swap.isExpired || block.timestamp >= swap.timelock) {
            return "EXPIRED";
        }
        
        return "ACTIVE";
    }

    /**
     * @dev Emergency function to pause the contract (only owner)
     */
    function emergencyPause() external {
        // This would require an owner modifier in a real implementation
        revert("Emergency pause not implemented");
    }
} 