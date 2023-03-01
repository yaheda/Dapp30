// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Address.sol";

contract Ebay {
  //1. Allow seller to create auction
  //2. Allow buyers to make offer for auction
  //3. Allow seller and buers to trade at end of an auction
  //4. getters functions for auctions and offers

  using Address for address payable;

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

  struct Offer {
    uint id;
    address payable buyer;
    uint auctionId;
    uint price;
  }

  mapping(uint => Auction) private auctions;
  uint private nextAuctionId = 1;
  mapping(uint => Offer) private offers;
  uint private nextOfferId = 1;
  mapping(address => uint[]) private userAuctions;
  mapping(address => uint[]) private userOffers;

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
    userAuctions[msg.sender].push(nextAuctionId);
    nextAuctionId++;
  }

  function createOffer(uint _auctionId) external payable auctionExist(_auctionId) {
    Auction storage auction = auctions[_auctionId];
    Offer storage bestOffer = offers[auction.bestOfferId];

    require(block.timestamp < auction.endDate, 'auction has expired');
    require(msg.value >= auction.minPrice && msg.value > bestOffer.price, 'value must be more to auction min and bestoffer');

    auction.bestOfferId = nextOfferId;
    auction.offerIds.push(nextOfferId);
    offers[nextOfferId] = Offer(nextOfferId, payable(msg.sender), _auctionId, msg.value);
    userOffers[msg.sender].push(nextOfferId);
    nextOfferId++;
  }

  function trade(uint _auctionId) external auctionExist(_auctionId) {
    Auction storage auction = auctions[_auctionId];
    Offer storage bestOffer = offers[auction.bestOfferId];

    require(block.timestamp >= auction.endDate, 'auction has not expired');

    for(uint i = 0; i < auction.offerIds.length; i++) {
      uint offerId = auction.offerIds[i];
      if (offerId != auction.bestOfferId) {
        Offer storage offer = offers[offerId];
        payable(offer.buyer).sendValue(offer.price);
      }
    }

    payable(auction.seller).sendValue(bestOffer.price);
  }

  function getAuctions() view external returns(Auction[] memory) {
    Auction[] memory _auctions = new Auction[](nextAuctionId - 1);
    for(uint i = 1; i <= nextAuctionId; i++) {
      _auctions[i - 1] = auctions[i];
    }
    return _auctions;
  }

  function getUserAuctions(address _user) view external returns(Auction[] memory) {
    uint[] storage userAuctionIds = userAuctions[_user];
    Auction[] memory _auctions = new Auction[](userAuctionIds.length);
    for(uint i = 0; i < userAuctionIds.length; i++) {
      uint auctionId = userAuctionIds[i];
      _auctions[i] = auctions[auctionId];
    }
    return _auctions;
  }

  function getOffers() view external returns(Offer[] memory) {
    Offer[] memory _offers = new Offer[](nextOfferId - 1);
    for(uint i = 1; i <= nextOfferId; i++) {
      _offers[i - 1] = offers[i];
    }
    return _offers;
  }

  function getUserOffers(address _user) view external returns(Offer[] memory) {
    uint[] storage userOfferIds = userOffers[_user];
    Offer[] memory _offers = new Offer[](userOfferIds.length);
    for(uint i = 0; i < userOfferIds.length; i++) {
      uint offerId = userOfferIds[i];
      _offers[i] = offers[offerId];
    }
    return _offers;
  }

  modifier auctionExist(uint _auctionId) {
    require(_auctionId > 0 && _auctionId < nextAuctionId, 'auction does not exist');
    _;
  }
}