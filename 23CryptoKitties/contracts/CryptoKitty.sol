// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import './ERC721Token.sol';

contract CryptoKitty is ERC721Token {

  enum HairColor { White, Black }

  struct Kitty {
    uint id;
    uint generation;
    uint geneA;
    uint geneB;
  }

  mapping (uint => Kitty) public kitties;
  uint public nextId;

  address public admin;
  

  constructor(
    string memory _name,
    string memory _symbol,
    string memory _tokenURIBase
  ) ERC721Token(_name, _symbol, _tokenURIBase) {
    admin = msg.sender;
    
  }

  function getAllKitties() external view returns(Kitty[] memory) {
    Kitty[] memory _kitties = new Kitty[](nextId);
    for(uint i = 0; i < _kitties.length; i++) {
      _kitties[i] = kitties[i];
    }
    return _kitties;
  }

  // function getAllKittiesOf(address owner) external view returns(Kitty[] memory) {

  // }

  function breed(uint kittyId1, uint kittyId2) external {
    require(kittyId1 < nextId, 'kitty1 does not exist');
    require(kittyId2 < nextId, 'kitty2 does not exist');

    Kitty storage kitty1 = kitties[kittyId1];
    Kitty storage kitty2 = kitties[kittyId2];

    require(ownerOf(kittyId1) == msg.sender, 'sender must own kitty1');
    require(ownerOf(kittyId2) == msg.sender, 'sender must own kitty2');

    uint maxGen = kitty1.generation > kitty2.generation ? kitty1.generation : kitty2.generation;
    uint geneA = _random(4) > 1 ? kitty1.geneA : kitty2.geneA;
    uint geneB = _random(4) > 1 ? kitty1.geneB : kitty2.geneB;
    kitties[nextId] = Kitty(nextId, maxGen + 1, geneA, geneB);
    _mint(nextId, msg.sender);
    nextId++;
  }

  function mint() external {
    require(msg.sender == admin, 'only admin');
    kitties[nextId] = Kitty(nextId, 1, _random(10), _random(10));
    _mint(nextId, msg.sender);
    nextId++;
  }

  function _random(uint max) internal view returns(uint) {
    return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % max;
  }
}