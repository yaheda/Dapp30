const Escrow = artifacts.require('Escrow.sol');

const { expectRevert } = require('@openzeppelin/test-helpers');

contract('Escrow', ([lawyer, payer, payee]) => {
  let escrow;

  beforeEach(async () => {
    escrow = await Escrow.new(payer, payee, 100, { from: lawyer});
  });

  contract('deposit', () => {
    it('Should deposit funds', async () => {
      await escrow.deposit({ from: payer, value: 100});
      var balance = await web3.eth.getBalance(escrow.address);
      assert(balance.toString() == 100);
    });
    it('Should not deposit if not payer', async () => {
      await expectRevert(
        escrow.deposit({ from: lawyer, value: 100}),
        'only payer'
      );
    });
    it('Should not deposit if not enough funds', async () => {
      await expectRevert(
        escrow.deposit({ from: payer, value: 10000}),
        'too much ether'
      );
    });
  });

  contract('release', () => {
    it('Should release the funds', async () => {
      var payeeBalanceBefore = await web3.eth.getBalance(payee);

      await escrow.deposit({ from: payer, value: 100});
      await escrow.release({ from: lawyer });

      var payeeBalanceAfter = await web3.eth.getBalance(payee);

      assert(web3.utils.toBN(payeeBalanceAfter).sub(web3.utils.toBN(payeeBalanceBefore)).toString() == '100');
    });
    it('Should not release funds if not enough funds', async () => {
      await expectRevert(
        escrow.release({ from: lawyer }),
        'not enough funds'
      );
    });
    it('Should not release funds if not lawyer', async () => {
      await escrow.deposit({ from: payer, value: 100});
      await expectRevert(
        escrow.release({ from: payee }),
        'only lawer'
      );
    });

  });

  contract('balanceof', async () => {
    it('Should return the balance', async () => {
      var balanceFromMethod = await escrow.balanceOf();
      var balanceFromWeb3 = await web3.eth.getBalance(escrow.address);

      assert(balanceFromMethod.toString() == balanceFromWeb3.toString());
    })
  })
});