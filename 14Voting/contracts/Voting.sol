// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {

  mapping(address => bool) public voters;
  
  struct Choice {
    uint id;
    string name;
    uint votes;
  }

  struct Ballot {
    uint id;
    string name;
    Choice[] choices;
    uint end;
  }

  mapping(uint => Ballot) public ballots;
  uint nextBallotId;

  mapping(address => mapping(uint => bool)) public votes;

  function addVoters(address[] calldata _voters) external onlyOwner {
    for(uint i = 0; i < _voters.length; i++) {
      voters[_voters[i]] = true;
    }
  }

  function createBallot(
    string calldata _name, 
    string[] calldata _choices, 
    uint offset) 
    external onlyOwner {
    /// WHY we are not creating the CHoices in memoty first...
    /// Reason: the array in the mapping struct is in storage and when we try to cast memory to call it will complain
    
    ballots[nextBallotId].id = nextBallotId;
    ballots[nextBallotId].name = _name;
    ballots[nextBallotId].end = block.timestamp + offset;

    for(uint i = 0; i < _choices.length; i++) {
      ballots[nextBallotId].choices.push(Choice(i, _choices[i], 0));
    }

    nextBallotId++;
  }

  function vote(uint ballotId, uint choiceId) external {
    require(voters[msg.sender] == true, 'only voter');
    require(votes[msg.sender][ballotId] == false, 'can only vote once');
    require(block.timestamp < ballots[ballotId].end, 'ballot has ended');

    votes[msg.sender][ballotId] = true;
    ballots[ballotId].choices[choiceId].votes++;    
  }

  function results(uint ballotId) view external returns(Choice[] memory) {
    require(block.timestamp >= ballots[ballotId].end, 'ballot has not ended');
    return ballots[ballotId].choices;
  }
}