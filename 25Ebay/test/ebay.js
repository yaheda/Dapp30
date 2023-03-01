const Ebay = artifacts.require('Ebay.sol');

const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract('Ebay', ([deployer, user1, user2, user3]) => {
  let ebay;
  beforeEach(async () => {
    cryptoKitty = await ebay.new();
  })
});