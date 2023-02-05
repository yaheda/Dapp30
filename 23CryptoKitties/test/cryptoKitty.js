const CryptoKitty = artifacts.require('CryptoKitty.sol');

const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract('ERC721Token', ([deployer, user1, user2, user3]) => {
  let cryptoKitty;

  beforeEach(async () => {
    cryptoKitty = await CryptoKitty.new('BenZona', 'BZ', 'www.benzona.com');
    for(var i = 0; i < 2; i++) {
      await cryptoKitty.mint();
    }
  })

  context('Mint', () => {
    it('Should mint token', async () => {
      var nextId = await cryptoKitty.nextId();
      assert.equal(nextId, '2'); 
    })
    it('should not mint token', async () => {
      await expectRevert(
        cryptoKitty.mint({from: user1}),
        'only admin'
      )
    })
  })

  context('Breed', () => {
    it('Should breed', async () => {
      await cryptoKitty.breed(0, 1);

      var kitty3 = await cryptoKitty.kitties.call(2);

      assert.equal(kitty3.id, '2')
      assert.equal(kitty3.generation, '2')
    })
  })
});