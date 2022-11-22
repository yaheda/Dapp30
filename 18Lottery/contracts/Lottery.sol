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

  function bet() external payable inState(State.BETTING) {
    require(msg.value == requiredPrice, 'can only send exact amount');

    players.push(payable(msg.sender));
    if (players.length == requiredParticipants) {
      // 1. pick a winner
      // 2. send money
      // 3. change state to idle
      // 4. data cleanup

      uint winner = _randomModulo(requiredParticipants);
      payable(players[winner]).sendValue((requiredParticipants * requiredPrice) * (100 - houseFee) / 100);
      currentState = State.IDLE;
      delete players;
    }
  }

  function cancel() external inState(State.BETTING) onlyOwner {
    for(uint i = 0; i < players.length; i++) {
      payable(players[i]).sendValue(requiredPrice);
    }
    delete players;
    currentState = State.IDLE;
  }

  function _randomModulo(uint modulo) view internal returns(uint) {
    return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % modulo;
  }

  modifier inState(State _state) {
    require(currentState == _state, 'current state does not allow this');
    _;
  }
}