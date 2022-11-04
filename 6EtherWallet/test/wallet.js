const EtherWallet = artifacts.require('EtherWallet.sol');

const { expectRevert } = require('@openzeppelin/test-helpers');

contract("Ether Wallet", ([deployer, user1, user2]) => {
  let etherWallet;

  beforeEach(async () => {
    etherWallet = await EtherWallet.new();
  });

  contract('Desposit', () => {
    it('Should deposit ether', async () => {
      await etherWallet.deposit({from:deployer, value: web3.utils.toWei('1')})
      var balance = await web3.eth.getBalance(etherWallet.address)
      assert.equal(balance, web3.utils.toWei('1'));
    });
  });

  contract('Balanceof', () => {
    it('Should get balance', async () => {
      await etherWallet.deposit({from:deployer, value: web3.utils.toWei('1')});
      var balance = await etherWallet.balanceOf();
      assert.equal(balance, web3.utils.toWei('1'));
    });
  });

  contract('Send', () => {
    it('Should send to user1', async () => {
      var user1BalanceBefore = await web3.eth.getBalance(user1)
      await etherWallet.deposit({from:deployer, value: web3.utils.toWei('10')});
      await etherWallet.send(user1, web3.utils.toWei('7'), { from: deployer });
      var user1BalanceAfter = await web3.eth.getBalance(user1);
      assert(web3.utils.toBN(user1BalanceAfter).gt(user1BalanceBefore));
    });
    it('Should not send from none owner', async () => {
      await expectRevert(
        etherWallet.send(user1, web3.utils.toWei('7'), { from: user2 }),
        'Ownable: caller is not the owner'
      );
    });
  });
})