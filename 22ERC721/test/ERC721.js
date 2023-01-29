const ERC721Token = artifacts.require('ERC721Token.sol');
const MockBadContract = artifacts.require('MockBadContract.sol');
const MockGoodContract = artifacts.require('MockGoodContract.sol');

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

  it('should mint if admin', async () => {
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
    await expectRevert(
      erc721Token.safeTransferFrom(user1, user2, 0, {from: user1}),
      'Transfer not authorised'
    );
  });

  it('should NOT transfer if not owner', async () => {
    await expectRevert(
      erc721Token.transferFrom(user1, user2, 0, {from: user1}),
      'Transfer not authorised'
    );
    await expectRevert(
      erc721Token.safeTransferFrom(user1, user2, 0, {from: user1}),
      'Transfer not authorised'
    );
  });

  //Bug here, skip this test :( see end code for explanation
  it(
    'safeTransferFrom() should NOT transfer if recipient contract does not implement erc721recipient interface', 
    async () => {
    
      var badContract = await MockBadContract.new();
      await expectRevert(
        erc721Token.safeTransferFrom(deployer, badContract.address, 0, { from: deployer}),
        'ERC721: transfer to non ERC721Receiver implementer'
      );
  });

  it('transferFrom() should transfer', async () => {
    var tokenId = 0;

    var tx = await erc721Token.transferFrom(deployer, user1, tokenId);
    var [balanceDeployer, balanceUser1, owner] = await Promise.all([
      erc721Token.balanceOf(deployer),
      erc721Token.balanceOf(user1),
      erc721Token.ownerOf(tokenId)
    ]);

    assert.equal(balanceDeployer, '2');
    assert.equal(balanceUser1, '1');
    assert.equal(owner, user1)

    await expectEvent(tx.receipt, 'Transfer', {
      _from: deployer,
      _to: user1,
      _tokenId: web3.utils.toBN(tokenId),
    });
  });

  it.only('safeTransferFrom() should transfer', async () => {
    var goodContract = await MockGoodContract.new();
    var tx = await erc721Token.safeTransferFrom(deployer, goodContract.address, 0, { from: deployer});
    await expectEvent(tx.receipt, 'Transfer', {
      _from: deployer,
      _to: goodContract.address,
      _tokenId: web3.utils.toBN(0),
    });
  });

  it('should transfer token when approved', async () => {
    var tokenId = 0;
    var tx1 = await erc721Token.approve(user3, tokenId);
    var tx2 = await erc721Token.transferFrom(deployer, user1, tokenId, { from: user3 });

    await expectEvent(tx1.receipt, 'Approval', {
      _owner: deployer,
      _approved: user3,
      _tokenId: web3.utils.toBN(tokenId),
    });

    await expectEvent(tx2.receipt, 'Transfer', {
      _from: deployer,
      _to: user1,
      _tokenId: web3.utils.toBN(tokenId),
    });

  });


})