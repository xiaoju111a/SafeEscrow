// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SimpleEscrow - Simplified version for standard Sepolia testing
 * @dev Non-encrypted version for demonstration purposes
 */
contract SimpleEscrow {
    struct Escrow {
        address buyer;
        address seller;
        address arbitrator;
        uint256 amount;  // Plain amount (not encrypted)
        EscrowState state;
        string description;
        uint256 createdAt;
        uint256 timeout;
        mapping(address => bool) signatures;
        uint256 signatureCount;
        bool buyerApproval;
        bool sellerApproval;
        bool arbitratorDecision;
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
        address arbitrator,
        uint256 amount
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
     * @dev Create a new escrow with plain amount
     */
    function createEscrow(
        address _seller,
        address _arbitrator,
        string calldata _description,
        uint256 _timeout
    ) external payable returns (uint256) {
        require(_seller != address(0) && _arbitrator != address(0), "Invalid addresses");
        require(_seller != msg.sender && _arbitrator != msg.sender, "Invalid participant roles");
        require(_seller != _arbitrator, "Seller and arbitrator must be different");
        require(msg.value > 0, "Must send ETH");

        uint256 escrowId = escrowCounter++;
        Escrow storage newEscrow = escrows[escrowId];

        newEscrow.buyer = msg.sender;
        newEscrow.seller = _seller;
        newEscrow.arbitrator = _arbitrator;
        newEscrow.amount = msg.value;
        newEscrow.state = EscrowState.Funded; // Directly funded
        newEscrow.description = _description;
        newEscrow.createdAt = block.timestamp;
        newEscrow.timeout = _timeout;
        newEscrow.buyerApproval = false;
        newEscrow.sellerApproval = false;
        newEscrow.arbitratorDecision = false;

        emit EscrowCreated(escrowId, msg.sender, _seller, _arbitrator, msg.value);
        emit EscrowFunded(escrowId);

        return escrowId;
    }

    /**
     * @dev Sign approval for escrow completion
     */
    function signApproval(uint256 escrowId) 
        external 
        validEscrow(escrowId) 
        onlyParticipant(escrowId) 
    {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.state == EscrowState.Funded, "Invalid escrow state");
        require(!escrow.signatures[msg.sender], "Already signed");

        escrow.signatures[msg.sender] = true;
        escrow.signatureCount++;

        if (msg.sender == escrow.buyer) {
            escrow.buyerApproval = true;
        } else if (msg.sender == escrow.seller) {
            escrow.sellerApproval = true;
        } else if (msg.sender == escrow.arbitrator) {
            escrow.arbitratorDecision = true;
        }

        emit SignatureAdded(escrowId, msg.sender);

        // Check for completion (2/3 signatures)
        _checkCompletion(escrowId);
    }

    /**
     * @dev Check if escrow can be completed
     */
    function _checkCompletion(uint256 escrowId) internal {
        Escrow storage escrow = escrows[escrowId];
        
        // 2/3 multi-sig logic
        bool buyerSellerApproval = escrow.buyerApproval && escrow.sellerApproval;
        bool buyerArbitratorApproval = escrow.buyerApproval && escrow.arbitratorDecision;
        bool sellerArbitratorApproval = escrow.sellerApproval && escrow.arbitratorDecision;
        
        bool shouldComplete = buyerSellerApproval || buyerArbitratorApproval || sellerArbitratorApproval;
        
        if (shouldComplete && escrow.state == EscrowState.Funded) {
            escrow.state = EscrowState.Completed;
            payable(escrow.seller).transfer(escrow.amount);
            emit EscrowCompleted(escrowId);
        }
    }

    /**
     * @dev Dispute an escrow
     */
    function disputeEscrow(uint256 escrowId) 
        external 
        validEscrow(escrowId) 
        onlyParticipant(escrowId) 
    {
        require(escrows[escrowId].state == EscrowState.Funded, "Invalid state");
        escrows[escrowId].state = EscrowState.Disputed;
        emit EscrowDisputed(escrowId);
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
        payable(escrow.buyer).transfer(escrow.amount);
        emit EscrowCancelled(escrowId);
    }

    /**
     * @dev Get escrow details
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
            uint256 signatureCount,
            uint256 amount
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
            escrow.signatureCount,
            escrow.amount
        );
    }

    /**
     * @dev Check if user has signed
     */
    function hasUserSigned(uint256 escrowId, address user) 
        external 
        view 
        validEscrow(escrowId) 
        returns (bool) 
    {
        return escrows[escrowId].signatures[user];
    }
}