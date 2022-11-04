// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EtherWallet is Ownable {

  using Address for address payable;

  function deposit() payable public {

  }

  function send(address payable _recipient, uint256 _amount) public onlyOwner {
    //_recipient.transfer(_amount);
    payable(_recipient).sendValue(_amount);
  }

  function balanceOf() view public returns(uint256) {
    return address(this).balance;
  }
}