const ERC721Token = artifacts.require('ERC721Token.sol');

const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract('ERC721Token', ([deployer, user1, user2, user3]) => {
  let erc721Token;

  beforeEach(async () => {
    erc721Token = await ERC721Token.new();
    for(var i = 0; i < 3; i++) {
      await erc721Token.mint();
    }
  })

  it('should NOT mint if not admin', async () => {
    await expectRevert(
      erc721Token.mint({from: user1}),
      'only admin'
    );
  });

  it.only('should mint if admin', async () => {
    var tx = await erc721Token.mint();
    var nextTokenId = await erc721Token.nextTokenId();
    var balance = await erc721Token.balanceOf(deployer);
    var owner = await erc721Token.ownerOf(3);

    assert.equal(nextTokenId, '4');
    assert.equal(balance, '4');
    assert.equal(owner, deployer);

    await expectEvent(tx.receipt, 'Transfer', {
      _from: '0x0000000000000000000000000000000000000000',
      _to: deployer,
      _tokenId: web3.utils.toBN(3),
    });
  });

  it('should NOT transfer if balance is 0', async () => {
    await expectRevert(
      erc721Token.transferFrom(user1, user2, 0, {from: user1}),
      'Transfer not authorised'
    );
  });

  it('should NOT transfer if not owner', async () => {
  });

  //Bug here, skip this test :( see end code for explanation
  it.skip(
    'safeTransferFrom() should NOT transfer if recipient contract does not implement erc721recipient interface', 
    async () => {
  });

  it('transferFrom() should transfer', async () => {
  });

  it('safeTransferFrom() should transfer', async () => {
  });

  it('should transfer token when approved', async () => {
  });


})