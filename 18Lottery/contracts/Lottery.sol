// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Lottery is Ownable {
  using Address for address payable;

  enum State {
    IDLE,
    BETTING
  }

  State public currentState = State.IDLE;
  address payable[] public players;
  uint public requiredParticipants; // reuired for each round
  uint public requiredPrice; // amount of eth to participate
  uint public houseFee; // percentage
  
  constructor(uint fee) {
    require(fee > 1 && fee < 99, 'fee between 1 and 99');
    houseFee = fee;
  }

  function createBet(uint nParticipants, uint price) external payable onlyOwner inState(State.IDLE) {
    requiredParticipants = nParticipants;
    requiredPrice = price;
    currentState = State.BETTING;
  }

  modifier inState(State _state) {
    require(currentState == _state, 'current state does not allow this');
    _;
  }
}