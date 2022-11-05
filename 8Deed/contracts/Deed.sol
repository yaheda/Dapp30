// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Deed is Ownable {

  using Address for address payable;

  address public lawyer;
  address payable public beneficiary;
  uint public amount;
  uint public earliestDateOfDonation;

  constructor(
    address _lawyer,
    address payable _beneficiary,
    uint _fromNow) payable {
      lawyer = _lawyer;
      beneficiary = _beneficiary;
      earliestDateOfDonation = block.timestamp + _fromNow;
    }

  function withdraw() public {
    require(msg.sender == lawyer, 'only lawyer');
    require(block.timestamp >= earliestDateOfDonation, 'too early');
    //beneficiary.transfer(address(this).balance);
    payable(beneficiary).sendValue(address(this).balance);
  }
}