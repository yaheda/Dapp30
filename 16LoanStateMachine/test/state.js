const StateMachine = artifacts.require('StateMachine.sol');

const { expectRevert, time } = require('@openzeppelin/test-helpers');

contract('State Machine', ([deployer, lender, borrower]) => {
  let stateMachine;

  beforeEach(async () => {
    stateMachine = await StateMachine.new(1000, 10, 30, borrower, lender);
  });

  contract('Fund', () => {
    it('Should fund', async () => {
      await stateMachine.fund({from: lender, value: 1000});
      var amount = await stateMachine.amount();
      var interest = await stateMachine.interest();
      var stateBorrower = await stateMachine.borrower();
      var stateLender = await stateMachine.lender();
      var state = await stateMachine.state();
      
      assert.equal(amount, '1000');
      assert.equal(interest, '10');
      assert.equal(stateBorrower, borrower);
      assert.equal(stateLender, lender);
      assert.equal(state, '1');
    });
    it('Should not fund if not lender', async () => {
      await expectRevert(
        stateMachine.fund({from: borrower, value: 1000}),
        'only lender'
      );
    });
    it('Should not fund if too much eth', async () => {
      await stateMachine.fund({from: lender, value: 1000});
      await expectRevert(
        stateMachine.fund({from: lender, value: 10000}),
        'too much eth'
      );
    });
  });

  contract('reimburse', () => {
    it('Should reimburse', async () => {           
      await stateMachine.fund({from: lender, value: 1000});
      var balanceBefore = await web3.eth.getBalance(lender);
      await time.increase(31 * 1000);
      await stateMachine.reimburse({from: borrower, value: 1010});

      var balanceAfter = await web3.eth.getBalance(lender);

      assert(web3.utils.toBN(balanceAfter).sub(web3.utils.toBN(balanceBefore)) == '1010');
    });
    it('Should not reimurse if not borrower', async () => {
      await stateMachine.fund({from: lender, value: 1000});
      await expectRevert(
        stateMachine.reimburse({from: lender, value: 1010}),
        'only borrower'
      );
    });
    it('Should not reimurse if not exact amount + interest', async () => {
      await stateMachine.fund({from: lender, value: 1000});
      await expectRevert(
        stateMachine.reimburse({from: borrower, value: 10100}),
        'need exact amount + interest'
      );
    });
  })
});