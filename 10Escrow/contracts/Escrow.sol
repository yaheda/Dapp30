// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Address.sol";

contract Escrow {

  using Address for address payable;

  address public payer;
  address payable public payee;
  address public lawyer;
  uint public amount;

  constructor(address _payer, address payable _payee, uint _amount) {
    payer = _payer;
    payee = _payee;
    amount = _amount;
    lawyer = msg.sender;
  }

  function deposit() payable public {
    require(msg.sender == payer, 'only payer');
    require(address(this).balance <= amount, 'too much ether');
  }

  function release() public {
    require(address(this).balance == amount, 'not enough funds');
    require(msg.sender == lawyer, 'only lawer');
    payable(payee).sendValue(address(this).balance);
  }

  function balanceOf() view public returns(uint) {
    return address(this).balance;
  }
}