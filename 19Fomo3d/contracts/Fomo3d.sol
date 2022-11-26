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
  uint public houseFee = 2;
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

  function bet() external payable inState(State.ACTIVE) {
    if (block.timestamp > endDate || block.timestamp > hardEndDate) {
      payable(msg.sender).sendValue(msg.value);
      _distribute();
      _createRound();
      return;
    }

    uint keyCount = msg.value / getKeyPrice();
    keys[msg.sender] += keyCount;
    totalKeys += keyCount;

    bool alreadyAdded = false;
    for(uint i = 0; i < keyHolders.length; i++) {
      if (keyHolders[i] == msg.sender) {
        alreadyAdded = true;
      }
    }

    if (!alreadyAdded) {
      keyHolders.push(payable(msg.sender));
    }

    pot += msg.value;
    endDate = endDate + 30 > hardEndDate ? hardEndDate : endDate + 30;
    
    king = payable(msg.sender);
  }

  function getKeyPrice() view public returns(uint) {
    uint periodCount = (block.timestamp - startDate) / 30;
    return initialKeyPrice + periodCount * 0.01 ether;
  }

  function _distribute() internal {
    uint netPot = pot * (100 - houseFee) / 100;
    payable(king).sendValue((netPot * 50) / 100);

    for (uint i = 0; i < keyHolders.length; i++) {
      address payable keyHolder = keyHolders[i];
      if (keyHolder != king) {
        payable(keyHolder).sendValue(((netPot * 50) / 100) * (keys[keyHolder] / totalKeys));
      }
    }
  }

  modifier inState(State state) {
    require(currentState == state, 'not in correct state');
    _;
  }

}