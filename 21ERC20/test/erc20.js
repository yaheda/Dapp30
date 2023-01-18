const ERC20Token = artifacts.require('ERC20Token.sol')

const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract('ERC20Token', ([deployer, user1, user2, user3]) => {
  let erc20Token;

  beforeEach(async () => {
    erc20Token = await ERC20Token.new('Benzona', 'BZN', 18, 1000000)
  })

  context('Transfer', () => {
    it('Should transfer tokens', async () => {
      var user1BalanceBefore = web3.utils.toBN(await erc20Token.balances(user1));
      var contractBalanceBefore = web3.utils.toBN(await erc20Token.balances(deployer));

      var tx = await erc20Token.transfer(user1, 100, { 
        from: deployer,
        gasPrice: 1
      });
      var gas = web3.utils.toBN(tx.receipt.gasUsed);

      var user1BalanceAfter = web3.utils.toBN(await erc20Token.balances(user1));
      var contractBalanceAfter = web3.utils.toBN(await erc20Token.balances(deployer));

      var userResult = user1BalanceBefore.eq(
        user1BalanceAfter.sub(web3.utils.toBN(100))
      )
      
      assert.equal(userResult, true);

    })
  })
});