const Deed = artifacts.require('Deed.sol');

const { expectRevert } = require('@openzeppelin/test-helpers');

contract('Deed', ([deployer, lawyer, user]) => {
  let deed;

  beforeEach(async () => {
    deed = await Deed.new(lawyer, user, 5, { value: 100});
  });

  contract('withdraw', () => {
    it('Should withdraw', async () => {
      var balanceBefore = await web3.eth.getBalance(user);

      await new Promise(resolve => setTimeout(resolve, 6000));

      await deed.withdraw({from: lawyer});

      var balanceAfrer = await web3.eth.getBalance(user);

      assert(web3.utils.toBN(balanceAfrer).sub(web3.utils.toBN(balanceBefore)) == 100);
    });
    it('Should not withdraw if not lawyer', async () => {
      await expectRevert(
        deed.withdraw({from: user}),
        'only lawyer'
      );
    });
    it('Should not withdraw if too early', async () => {
      await expectRevert(
        deed.withdraw({from: lawyer}),
        'too early'
      );
    });
  });
});