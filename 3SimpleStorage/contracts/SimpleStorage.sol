// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract SimpleStorage {
  string public data = 'my data';

  function setData(string memory _data) public {
    data = _data;
  }

  function getData() view public returns (string memory) {
    return data;
  }
}