const SplitPayment = artifacts.require('SplitPayment.sol');

const { expectRevert } = require('@openzeppelin/test-helpers');

contract('SplitPayment', ([deployer, user1, user2]) => {
  let splitPayment;

  beforeEach(async () => {
    splitPayment = await SplitPayment.new();
  });

  contract('Send', () => {
    it('Should not send if not owner', async () => {
      await expectRevert(
        splitPayment.send([user1, user2], [10,10], { from: user1, value: web3.utils.toWei('1') }),
        'Ownable: caller is not the owner'
      );
    });
    it('Should not send if legnth mismatch', async () => {
      await expectRevert(
        splitPayment.send([user1, user2], [10,10,10], { from: deployer, value: web3.utils.toWei('1') }),
        'params are not the same length'
      );
    });
    it('Should send to users', async () => {
      var user1BalanceBefore = await web3.eth.getBalance(user1);
      var user2BalanceBefore = await web3.eth.getBalance(user2);

      await splitPayment.send([user1, user2], [12,27], { from: deployer, value: web3.utils.toWei('1') });

      var user1BalanceAfter = await web3.eth.getBalance(user1);
      var user2BalanceAfter = await web3.eth.getBalance(user2);

      assert(web3.utils.toBN(user1BalanceAfter).gt(web3.utils.toBN(user1BalanceBefore)));
      assert(web3.utils.toBN(user2BalanceAfter).gt(web3.utils.toBN(user2BalanceBefore)));
    });
  });
});