// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/Address.sol';

contract StateMachine {
  using Address for address payable;

  /**
    PENDING - Investors are funding
    ACTIVE - 
    CLOSED - when maturity is reached
   */
  enum State {
    PENDING,
    ACTIVE,
    CLOSED
  }

  State public state = State.PENDING;
  uint public amount;
  uint public interest;
  uint public end;
  address payable public borrower;
  address payable public lender;
  
  constructor(
    uint _amount,
    uint _interest,
    uint _duration,
    address payable _borrower,
    address payable _lender
  ) {
    amount = _amount;
    interest = _interest;
    end = block.timestamp + _duration;
    borrower = _borrower;
    lender = _lender;
  }

  function fund() payable external {
    require(msg.sender == lender, 'only lender');
    require(address(this).balance == amount, 'too much eth');
    _transitionTo(State.ACTIVE);
    payable(borrower).sendValue(amount);
  }

  function reimburse() payable external {
    require(msg.sender == borrower, 'only borrower');
    require(msg.value == amount + interest, 'need exact amount + interest');
    _transitionTo(State.CLOSED);
    payable(lender).sendValue(amount + interest);
  }

  function _transitionTo(State to) internal {
    require(to != State.PENDING, 'cannot go back to pending state');
    require(to != state, 'cannot change to current state');
    if (to == State.ACTIVE) {
      require(state == State.PENDING, 'can only move to active from pending');
      state = State.ACTIVE;
    }
    if (to == State.CLOSED) {
      require(state == State.ACTIVE, 'can only move to closed from active');
      require(block.timestamp >= end, 'loan hasnt matured yet');
      state = State.CLOSED;
    }
  }
}