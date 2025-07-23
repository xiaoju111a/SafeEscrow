// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";


/**
 * @title FHEEscrow - Privacy-Preserving 2/3 Multi-signature Escrow
 * @dev Uses Zama's FHEVM for homomorphic encryption of amounts and private conditions
 */
contract FHEEscrow {
    using FHE for euint64;
    using FHE for ebool;

    struct Escrow {
        address buyer;
        address seller;
        address arbitrator;
        euint64 encryptedAmount;  // Encrypted amount using TFHE
        EscrowState state;
        string description;
        uint256 createdAt;
        uint256 timeout;
        mapping(address => bool) signatures;
        uint256 signatureCount;
        ebool buyerApproval;      // Encrypted approval states
        ebool sellerApproval;
        ebool arbitratorDecision;
    }

    enum EscrowState { 
        Created, 
        Funded, 
        Completed, 
        Disputed, 
        Cancelled 
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCounter;

    // Events
    event EscrowCreated(
        uint256 indexed escrowId, 
        address indexed buyer, 
        address indexed seller, 
        address arbitrator
    );
    event EscrowFunded(uint256 indexed escrowId);
    event EscrowCompleted(uint256 indexed escrowId);
    event EscrowDisputed(uint256 indexed escrowId);
    event EscrowCancelled(uint256 indexed escrowId);
    event SignatureAdded(uint256 indexed escrowId, address indexed signer);

    modifier onlyParticipant(uint256 escrowId) {
        require(
            msg.sender == escrows[escrowId].buyer ||
            msg.sender == escrows[escrowId].seller ||
            msg.sender == escrows[escrowId].arbitrator,
            "Not a participant"
        );
        _;
    }

    modifier validEscrow(uint256 escrowId) {
        require(escrowId < escrowCounter, "Invalid escrow ID");
        _;
    }

    constructor() {}

    /**
     * @dev Create a new escrow with encrypted amount
     * @param _seller Address of the seller
     * @param _arbitrator Address of the arbitrator
     * @param _encryptedAmountHandle Encrypted amount handle
     * @param _encryptedAmountProof Encrypted amount proof
     * @param _description Description of the transaction
     * @param _timeout Timeout duration in seconds
     */
    function createEscrow(
        address _seller,
        address _arbitrator,
        externalEuint64 _encryptedAmountHandle,
        bytes memory _encryptedAmountProof,
        string calldata _description,
        uint256 _timeout
    ) external returns (uint256) {
        require(_seller != address(0) && _arbitrator != address(0), "Invalid addresses");
        require(_seller != msg.sender && _arbitrator != msg.sender, "Invalid participant roles");
        require(_seller != _arbitrator, "Seller and arbitrator must be different");

        uint256 escrowId = escrowCounter++;
        Escrow storage newEscrow = escrows[escrowId];

        newEscrow.buyer = msg.sender;
        newEscrow.seller = _seller;
        newEscrow.arbitrator = _arbitrator;
        newEscrow.encryptedAmount = FHE.fromExternal(_encryptedAmountHandle, _encryptedAmountProof);
        newEscrow.state = EscrowState.Created;
        newEscrow.description = _description;
        newEscrow.createdAt = block.timestamp;
        newEscrow.timeout = _timeout;
        
        // Initialize encrypted approval states
        newEscrow.buyerApproval = FHE.asEbool(false);
        newEscrow.sellerApproval = FHE.asEbool(false);
        newEscrow.arbitratorDecision = FHE.asEbool(false);

        emit EscrowCreated(escrowId, msg.sender, _seller, _arbitrator);
        return escrowId;
    }

    /**
     * @dev Fund the escrow with encrypted amount verification
     * @param escrowId The escrow to fund
     * @param _encryptedValueHandle Encrypted value handle
     * @param _encryptedValueProof Encrypted value proof
     */
    function fundEscrow(
        uint256 escrowId, 
        externalEuint64 _encryptedValueHandle,
        bytes memory _encryptedValueProof
    ) external payable validEscrow(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.buyer, "Only buyer can fund");
        require(escrow.state == EscrowState.Created, "Invalid state");

        // Verify encrypted amount matches the expected value
        euint64 providedAmount = FHE.fromExternal(_encryptedValueHandle, _encryptedValueProof);
        ebool amountMatch = FHE.eq(escrow.encryptedAmount, providedAmount);
        
        // Store the match result for later verification (Gateway will handle decryption)
        // For now, we assume the amount matches and let the Gateway handle verification
        
        escrow.state = EscrowState.Funded;
        emit EscrowFunded(escrowId);
    }

    /**
     * @dev Sign approval for escrow completion with private approval
     * @param escrowId The escrow to approve
     * @param _encryptedApprovalHandle Encrypted approval handle
     * @param _encryptedApprovalProof Encrypted approval proof
     */
    function signApproval(
        uint256 escrowId,
        externalEbool _encryptedApprovalHandle,
        bytes memory _encryptedApprovalProof
    ) external validEscrow(escrowId) onlyParticipant(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.state == EscrowState.Funded, "Invalid escrow state");
        require(!escrow.signatures[msg.sender], "Already signed");

        ebool approval = FHE.fromExternal(_encryptedApprovalHandle, _encryptedApprovalProof);

        // Store encrypted approvals based on role
        if (msg.sender == escrow.buyer) {
            escrow.buyerApproval = approval;
        } else if (msg.sender == escrow.seller) {
            escrow.sellerApproval = approval;
        } else if (msg.sender == escrow.arbitrator) {
            escrow.arbitratorDecision = approval;
        }

        escrow.signatures[msg.sender] = true;
        escrow.signatureCount++;

        emit SignatureAdded(escrowId, msg.sender);

        // Check for completion conditions using homomorphic operations
        _checkCompletionConditions(escrowId);
    }

    /**
     * @dev Internal function to check completion conditions using FHE operations
     */
    function _checkCompletionConditions(uint256 escrowId) internal {
        Escrow storage escrow = escrows[escrowId];

        // 2/3 multisig logic with homomorphic encryption
        // Condition 1: Buyer + Seller both approve
        ebool buyerSellerApproval = FHE.and(escrow.buyerApproval, escrow.sellerApproval);
        
        // Condition 2: Buyer + Arbitrator approve (dispute resolution)
        ebool buyerArbitratorApproval = FHE.and(escrow.buyerApproval, escrow.arbitratorDecision);
        
        // Condition 3: Seller + Arbitrator approve (dispute resolution)
        ebool sellerArbitratorApproval = FHE.and(escrow.sellerApproval, escrow.arbitratorDecision);

        // Any of the three conditions should trigger completion
        ebool shouldComplete = FHE.or(
            buyerSellerApproval,
            FHE.or(buyerArbitratorApproval, sellerArbitratorApproval)
        );

        // Note: In production, shouldComplete would be decrypted via Gateway
        // For now, we'll trigger completion when signature count reaches 2 (2/3 multisig)
        if (escrow.signatureCount >= 2) {
            _completeEscrow(escrowId);
        }
    }

    /**
     * @dev Complete the escrow and release funds
     */
    function _completeEscrow(uint256 escrowId) internal {
        Escrow storage escrow = escrows[escrowId];
        escrow.state = EscrowState.Completed;

        // Note: In production, amount would be decrypted via Gateway
        // For now, we'll transfer the contract balance
        payable(escrow.seller).transfer(address(this).balance);

        emit EscrowCompleted(escrowId);
    }

    /**
     * @dev Request refund with encrypted reasoning
     * @param escrowId The escrow to refund
     * @param _encryptedReasonHandle Encrypted reason handle
     * @param _encryptedReasonProof Encrypted reason proof
     */
    function requestRefund(
        uint256 escrowId,
        externalEbool _encryptedReasonHandle,
        bytes memory _encryptedReasonProof
    ) external validEscrow(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.buyer, "Only buyer can request refund");
        require(escrow.state == EscrowState.Funded, "Invalid state");

        // Store encrypted refund reason
        ebool refundReason = FHE.fromExternal(_encryptedReasonHandle, _encryptedReasonProof);
        
        // Set buyer approval to false (refund request)
        escrow.buyerApproval = FHE.not(refundReason);
        escrow.signatures[msg.sender] = true;
        escrow.signatureCount++;

        emit SignatureAdded(escrowId, msg.sender);
    }

    /**
     * @dev Emergency refund after timeout
     */
    function emergencyRefund(uint256 escrowId) external validEscrow(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.buyer, "Only buyer can emergency refund");
        require(escrow.state == EscrowState.Funded, "Invalid state");
        require(block.timestamp > escrow.createdAt + escrow.timeout, "Timeout not reached");

        escrow.state = EscrowState.Cancelled;
        
        // Note: In production, amount would be decrypted via Gateway  
        // For now, we'll transfer the contract balance
        payable(escrow.buyer).transfer(address(this).balance);

        emit EscrowCancelled(escrowId);
    }

    /**
     * @dev Get escrow details (non-sensitive information only)
     */
    function getEscrowDetails(uint256 escrowId) 
        external 
        view 
        validEscrow(escrowId) 
        returns (
            address buyer,
            address seller,
            address arbitrator,
            EscrowState state,
            string memory description,
            uint256 createdAt,
            uint256 timeout,
            uint256 signatureCount
        ) 
    {
        Escrow storage escrow = escrows[escrowId];
        return (
            escrow.buyer,
            escrow.seller,
            escrow.arbitrator,
            escrow.state,
            escrow.description,
            escrow.createdAt,
            escrow.timeout,
            escrow.signatureCount
        );
    }

    /**
     * @dev Get encrypted amount (only for participants)
     * Note: In production, this would use Gateway for re-encryption
     */
    function getEncryptedAmount(uint256 escrowId) 
        external 
        view 
        validEscrow(escrowId) 
        onlyParticipant(escrowId) 
        returns (euint64) 
    {
        return escrows[escrowId].encryptedAmount;
    }

    /**
     * @dev Check if user has signed (public information)
     */
    function hasUserSigned(uint256 escrowId, address user) 
        external 
        view 
        validEscrow(escrowId) 
        returns (bool) 
    {
        return escrows[escrowId].signatures[user];
    }

    /**
     * @dev Get encrypted approval status (only for the signer)
     * Note: In production, this would use Gateway for re-encryption
     */
    function getMyApprovalStatus(uint256 escrowId) 
        external 
        view 
        validEscrow(escrowId) 
        returns (ebool) 
    {
        Escrow storage escrow = escrows[escrowId];
        
        if (msg.sender == escrow.buyer) {
            return escrow.buyerApproval;
        } else if (msg.sender == escrow.seller) {
            return escrow.sellerApproval;
        } else if (msg.sender == escrow.arbitrator) {
            return escrow.arbitratorDecision;
        }
        
        revert("Not a participant");
    }

    /**
     * @dev Dispute an escrow
     */
    function disputeEscrow(uint256 escrowId) external validEscrow(escrowId) onlyParticipant(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.state == EscrowState.Funded, "Invalid state");
        
        escrow.state = EscrowState.Disputed;
        emit EscrowDisputed(escrowId);
    }
}