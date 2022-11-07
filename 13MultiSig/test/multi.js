const MultiSig = artifacts.require('Multisig.sol');

const { expectRevert } = require('@openzeppelin/test-helpers');

contract('MultiSig', ([approver1, approver2, user3, approver3]) => {
  let multiSig;

  beforeEach(async () => {
    multiSig = await MultiSig.new([approver1,approver2,approver3], 2, { value: 1000 });
  });

  contract('Create Transfer', () => {
    it('Should not create transfer if not approver', async () => {
      await expectRevert(
        multiSig.createTransfer(10, approver1, { from: user3}),
        'only approver'
      );
    });
    it('Should create transfer', async () => {
      await multiSig.createTransfer(10, user3, { from: approver1});
      var transfer = await multiSig.transfers(0);
      assert(transfer[0] == '0');
      assert(transfer[1] == '10');
      assert(transfer[2] == user3);
      assert(transfer[3] == '0');
      assert(transfer[4] == false);
    });
  });

  contract('Approve', () => {
    it('Should approve', async () => {
      var balanceBefore = await web3.eth.getBalance(user3);

      await multiSig.createTransfer(10, user3, { from: approver1});
      await multiSig.Approve(0, { from: approver1});
      await multiSig.Approve(0, { from: approver2});

      var transfer = await multiSig.transfers(0);
      assert(transfer[0] == '0');
      assert(transfer[1] == '10');
      assert(transfer[2] == user3);
      assert(transfer[3] == '2');
      assert(transfer[4] == true);

      var balanceAfter = await web3.eth.getBalance(user3);
      assert(web3.utils.toBN(balanceAfter).sub(web3.utils.toBN(balanceBefore)).toString() == '10');
    });
    it('Should not approve if not approver', async () => {
      await expectRevert(
        multiSig.Approve(0, { from: user3}),
        'only approver'
      );
    });
    it('Should not approve if already approved', async () => {
      await multiSig.createTransfer(10, user3, { from: approver1});
      await multiSig.Approve(0, { from: approver1});

      await expectRevert(
        multiSig.Approve(0, { from: approver1}),
        'already approved'
      );
    });
    it('Should not approve if already sent', async () => {
      await multiSig.createTransfer(10, user3, { from: approver1});
      await multiSig.Approve(0, { from: approver1});
      await multiSig.Approve(0, { from: approver2});

      await expectRevert(
        multiSig.Approve(0, { from: approver3}),
        'already sent'
      );
    });
  });
});