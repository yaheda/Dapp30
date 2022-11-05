// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SplitPayment is Ownable {

  using Address for address payable;

  function send(address payable[] memory _to, uint[] memory _amounts) public payable onlyOwner {
    require(_to.length == _amounts.length, 'params are not the same length');
    for(uint i; i < _to.length; i++) {
      //_to[i].transfer(_amounts[i]);
      payable(_to[i]).sendValue(_amounts[i]);
    }
  } 
}