// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import './ERC721Token.sol';

contract CryptoKitty is ERC721Token {

  address public admin;

  constructor(
    string memory _name,
    string memory _symbol,
    string memory _tokenURIBase
  ) ERC721Token(_name, _symbol, _tokenURIBase) {
    admin = msg.sender;
  }

  function mint() external {
    require(msg.sender == admin, 'only admin');
  }
}