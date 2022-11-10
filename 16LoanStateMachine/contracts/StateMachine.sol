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
    payable(borrower).sendValue(amount);
  }

  function reimburse() payable external {
    require(msg.sender == borrower, 'only borrower');
    require(msg.value == amount + interest, 'need exact amount + interest');
    payable(lender).sendValue(amount + interest);
  }
}