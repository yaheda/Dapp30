// SPDX-License-Identifier
pragma solidity 0.8.17;

contract Ebay {
  //1. Allow seller to create auction
  //2. Allow buyers to make offer for auction
  //3. Allow seller and buers to trade at end of an auction

  struct Auction {
    uint id;
    address payable seller;
    string name;
    string description;
    uint minPrice;
    uint endDate;
    uint bestOfferId;
    uint[] offerIds;
  }

  mapping(uint => Auction) private auctions;
  uint private nextAuctionId = 1;

  function createAuction(
    string calldata _name,
    string calldata _description,
    uint _minPrice,
    uint _duration
  ) external {
    require(_minPrice > 0, 'minimum price must be more than 0');
    require(_duration > 86400 && _duration < 864000, 'duration must be between 1 to 10 days');
    
    uint[] memory offerIds = new uint[](0);
    auctions[nextAuctionId] = Auction(
      nextAuctionId,
      payable(msg.sender),
      _name,
      _description,
      _minPrice,
      block.timestamp + _duration,
      0,
      offerIds
    );
    nextAuctionId++;
  }
}