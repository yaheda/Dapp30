// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Fomo3d {
  using Address for address payable;

  enum State {
    INACTIVE,
    ACTIVE
  }

  State public currentState = State.INACTIVE;
  address payable public king;
  uint public startDate;
  uint public endDate; // end date of current timer
  uint public hardEndDate;
  uint public pot; // total amounts
  uint public initialKeyPrice;
  uint public totalKeys;
  address payable[] public keyHolders;
  mapping(address => uint) public keys;

  function kickStart() external inState(State.INACTIVE) {
    currentState = State.ACTIVE;
    _createRound();
  }

  function _createRound() internal {
    //1. data cleanup
    //2. setup data for next round

    for(uint i = 0; i < keyHolders.length; i++) {
      delete keys[keyHolders[i]];
    }
    delete keyHolders;
    totalKeys = 0;

    startDate = block.timestamp;
    endDate = block.timestamp + 30;
    hardEndDate = block.timestamp + 86400; // a day
    initialKeyPrice = 1 ether;
  }

  modifier inState(State state) {
    require(currentState == state, 'not in correct state');
    _;
  }

}