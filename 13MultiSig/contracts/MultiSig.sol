// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Address.sol";

contract MultiSig {

  using Address for address payable;

  address[] public approvers;
  uint public quorum;

  struct Transfer {
    uint id;
    uint amount;
    address recipient;
    uint approvals;
    bool sent;
  }

  mapping(uint => Transfer) public transfers;
  uint nextId;

  mapping(address => mapping(uint => bool)) approved;

  constructor(address[] memory _approvers, uint _quorum) payable {
    approvers = _approvers;
    quorum = _quorum;
  }

  function createTransfer(uint _amount, address payable _to) external onlyApprover {
    transfers[nextId] = Transfer(nextId, _amount, _to, 0, false);
    nextId++;
  }

  function Approve(uint _id) external onlyApprover {
    require(approved[msg.sender][_id] == false, 'already approved');
    require(transfers[_id].sent == false, 'already sent');

    approved[msg.sender][_id] = true;
    transfers[_id].approvals++;

    if (transfers[_id].approvals == quorum) {
      transfers[_id].sent = true;
      payable(transfers[_id].recipient).sendValue(transfers[_id].amount);
    }
  }

  modifier onlyApprover() {
    bool isApprover = false;
    for (uint i; i < approvers.length; i++) {
      if (msg.sender == approvers[i]) {
        isApprover = true;
      }
    }
    require(isApprover == true, 'only approver');
    _;
  }

  
}