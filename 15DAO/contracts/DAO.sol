// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

/**
  DAO Contract
  1. Collects investors money (ether)
  2. Keep track of investor contributions with shares
  3. Allow investors to transfer shares
  4. Allow investment proposals to be created and voted
  5. Execute successful investment proposals (e.i send money)
 */

import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract DAO is Ownable {
  using Address for address payable;

  mapping(address => bool) public investors;
  mapping(address => uint) public shares;
  uint public totalShares;
  uint public availableFunds;
  uint public contributionEnd;

  struct Proposal {
    uint id;
    string name;
    uint amount;
    address payable recipient; // ether sent to another smart contract which will represent the investment
    uint votes;
    uint end;
    bool executed;
  }

  mapping(uint => Proposal) public proposals;
  uint public nextProposalId;
  mapping(address => mapping(uint => bool)) public votes;
  uint public voteTime;
  uint public quorum; /// percentage

  constructor(uint contributionTime, uint _voteTime, uint _quorum) {
    require(_quorum > 0 && _quorum < 100, 'quorum must be between 0 and 100');
    contributionEnd = block.timestamp + contributionTime;
    voteTime = _voteTime;
    quorum = _quorum;
  }

  /// 1 wei = 1 share
  function contribute() payable external {
    require(block.timestamp < contributionEnd, 'contribution ended');

    investors[msg.sender] = true;
    shares[msg.sender] += msg.value;
    totalShares += msg.value;
    availableFunds += msg.value;
  }

  /// 1 share = 1 wei
  /// normally the value of the investment fluctuates after being invested in different smart contracts
  /// one way to measure is using and "Oracle" but we'll keep it simple here
  /// --> release back to the dao
  function redeemShare(uint nShares) external { 
    require(shares[msg.sender] >= nShares, 'not enough shares');
    require(availableFunds >= nShares, 'not enough funds');

    shares[msg.sender] -= nShares;
    availableFunds -= nShares;

    payable(msg.sender).sendValue(nShares);
  }

  /// --> transfer between users
  /// can happen on a dex which will handle the ether transfer between the parties
  function transferShare(uint nShares, address recipient) external { 
    require(shares[msg.sender] >= nShares, 'not enough shares');
    require(availableFunds >= nShares, 'not enough funds');

    shares[msg.sender] -= nShares;
    shares[recipient] += nShares;

    investors[recipient] = true;
  }

  function createProposal(string memory name, uint amount, address payable recipient) external onlyInvestors {
    require(availableFunds >= amount, 'amount too big');

    proposals[nextProposalId] = Proposal(
      nextProposalId,
      name,
      amount,
      recipient,
      0,
      block.timestamp + voteTime,
      false
    );

    availableFunds -= amount;
    nextProposalId++;
  }

  function vote(uint proposalId) external onlyInvestors {
    Proposal storage proposal = proposals[proposalId];

    require(votes[msg.sender][proposalId] == false, 'has already voted');
    require(block.timestamp < proposal.end, 'proposal ended');

    votes[msg.sender][proposalId] = true;
    proposal.votes += shares[msg.sender];
  }

  function executeProposal(uint proposalId) external onlyOwner {
    Proposal storage proposal = proposals[proposalId];

    require(block.timestamp >= proposal.end, 'proposal not ended');
    require(proposal.executed == false, 'already executed');
    require((proposal.votes / totalShares) * 100 >= quorum, 'not enough votes');

    _transferEther(proposal.amount, proposal.recipient);
  }

  function withdrawEther(uint amount, address payable to) external onlyOwner {
    _transferEther(amount, to);
  }

  /// react when ether is sent to smart contract
  receive () external payable {
    availableFunds += msg.value;
  }

  function _transferEther(uint amount, address payable to) internal {
    require(amount <= availableFunds, 'not enough funds');

    availableFunds -= amount;
    payable(to).sendValue(amount);
  }

  modifier onlyInvestors() {
    require(investors[msg.sender] == true, 'only investors');
    _;
  }
}