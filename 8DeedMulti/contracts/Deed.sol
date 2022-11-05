// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Deed is Ownable {

  using Address for address payable;

  address public lawyer;
  address payable public beneficiary;
  uint public earliestDateOfDonation;

  uint public amount;
  uint constant public PAYOUTS = 10;
  uint constant public INTERVAL = 10;
  uint public paidPayouts; 

  constructor(
    address _lawyer,
    address payable _beneficiary,
    uint _fromNow) payable {
      lawyer = _lawyer;
      beneficiary = _beneficiary;
      earliestDateOfDonation = block.timestamp + _fromNow;
      amount = msg.value / PAYOUTS;
    }

  function withdraw() public {
    require(msg.sender == beneficiary, 'only beneficiary');
    require(block.timestamp >= earliestDateOfDonation, 'too early');
    require(paidPayouts < PAYOUTS, 'no more payouts');
    //beneficiary.transfer(address(this).balance);

    uint elligiblePayouts = 
      ((block.timestamp - earliestDateOfDonation) / INTERVAL);

    uint duePayouts = elligiblePayouts - paidPayouts;
    duePayouts = duePayouts + paidPayouts <= PAYOUTS ? PAYOUTS - paidPayouts : duePayouts;

    paidPayouts += duePayouts;

    payable(beneficiary).sendValue(duePayouts * amount);
  }
}