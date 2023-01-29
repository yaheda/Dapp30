pragma solidity 0.8.17;

interface ERC721TokenReceiver {
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external returns(bytes4);
}

contract MockGoodContract is ERC721TokenReceiver {
  bytes4 internal constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;
  function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external returns(bytes4) {
    return MAGIC_ON_ERC721_RECEIVED;
  }
  
}