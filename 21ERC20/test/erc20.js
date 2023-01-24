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
      var contractResult = contractBalanceBefore.eq(
        contractBalanceAfter.add(web3.utils.toBN(100))
      );

      console.log('Before', contractBalanceBefore.toString())
      console.log('After', contractBalanceAfter.toString())
      console.log('Gas', gas.toString())
      
      assert.equal(userResult, true);
      assert.equal(contractResult, true);

      expectEvent(tx.receipt, 'Transfer', {
        from: deployer,
        to: user1,
        tokens: web3.utils.toBN(100),
      });

    })
    it('Should not transfer if not enough tokens', async () => {
      await expectRevert(
        erc20Token.transfer(user1, 1000001),
        'not enough tokens'
      )
    })
  })

  context('Approve', () => {
    it('Should approve token', async () => {
      var tx = await erc20Token.approve(user3, 1000, {from: user1});
      expectEvent(tx.receipt, 'Approval', {
        tokenOwner: user1,
        spender: user3,
        tokens: web3.utils.toBN(1000),
      });
    })
    it('Should not approve itself', async () => {
      await expectRevert(
        erc20Token.approve(user1, 1000, {from: user1}),
        'sender cannot approve itself'
      )
    })
  })

  context('Transfer From', () => {
    it('Should transfer from', async () => {
      await erc20Token.transfer(user1, 1000)
      await erc20Token.approve(user3, 700, {from: user1});
      var tx = await erc20Token.transferFrom(user1, user2, 15, {from: user3});
      expectEvent(tx.receipt, 'Transfer', {
        from: user1,
        to: user2,
        tokens: web3.utils.toBN(15),
      });
    })
    it('Should not transfer from if allowance is too low', async () => {
      await erc20Token.approve(user3, 2, {from: user1});
      await expectRevert(
        erc20Token.transferFrom(user1, user2, 15, {from: user3}),
        'allowance too low'
      )
    })
    it('Should not transfer from if not enough tokens', async () => {
      await erc20Token.transfer(user1, 10)
      await erc20Token.approve(user3, 700, {from: user1});
      await expectRevert(
        erc20Token.transferFrom(user1, user2, 15, {from: user3}),
        'not enough tokens'
      )
    })
  })

  context('Allowance', () => {
    it('Should return allowance', async () => {
      await erc20Token.approve(user3, 700, {from: user1});
      var allowance = await erc20Token.allowance(user1, user3);
      assert.equal(allowance.toString(), '700');
    })
  })

  context('balanceOf', () => {
    it('Should return balanceOf', async () => {
      await erc20Token.transfer(user1, 10)
      var balance = await erc20Token.balanceOf(user1);
      assert.equal(balance.toString(), '10');
    })
  })
});