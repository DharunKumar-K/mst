// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICirqProofRegistry {
    function setSettled(string memory batchId) external;
}

contract CirqProofSettlement {
    ICirqProofRegistry public registry;

    struct Settlement {
        uint256 amount;
        address depositor;
        bool isHeld;
        bool isSettled;
    }

    mapping(string => Settlement) public settlements;

    event Deposited(string batchId, address depositor, uint256 amount);
    event Released(string batchId, address recipient, uint256 amount);
    event Held(string batchId);
    event Refunded(string batchId, address recipient, uint256 amount);

    constructor(address _registry) {
        registry = ICirqProofRegistry(_registry);
    }

    function deposit(string memory batchId) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(settlements[batchId].amount == 0, "Already deposited");

        settlements[batchId] = Settlement({
            amount: msg.value,
            depositor: msg.sender,
            isHeld: false,
            isSettled: false
        });

        emit Deposited(batchId, msg.sender, msg.value);
    }

    function release(string memory batchId) external {
        Settlement storage settlement = settlements[batchId];
        require(settlement.amount > 0, "No deposit found");
        require(!settlement.isSettled, "Already settled");
        require(!settlement.isHeld, "Funds are held");

        settlement.isSettled = true;
        
        registry.setSettled(batchId);

        uint256 amount = settlement.amount;
        payable(settlement.depositor).transfer(amount);

        emit Released(batchId, settlement.depositor, amount);
    }

    function hold(string memory batchId) external {
        Settlement storage settlement = settlements[batchId];
        require(settlement.amount > 0, "No deposit found");
        require(!settlement.isSettled, "Already settled");

        settlement.isHeld = true;

        emit Held(batchId);
    }

    function refund(string memory batchId) external {
        Settlement storage settlement = settlements[batchId];
        require(settlement.amount > 0, "No deposit found");
        require(!settlement.isSettled, "Already settled");
        require(settlement.isHeld, "Funds must be held to refund");

        settlement.isSettled = true;
        
        registry.setSettled(batchId);

        uint256 amount = settlement.amount;
        payable(settlement.depositor).transfer(amount);

        emit Refunded(batchId, settlement.depositor, amount);
    }
}
