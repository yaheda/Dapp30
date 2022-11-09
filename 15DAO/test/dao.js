const DAO = artifacts.require('DAO.sol');

const { expectRevert, time } = require('@openzeppelin/test-helpers');

contract('DAO', ([deployer, investor1, investor2, investor3]) => {
  let dao;

  beforeEach(async () => {
    dao = await DAO.new(30, 30, 66);
  });

  contract('contribute', () => {
    it('Should contribute', async () => {
      await dao.contribute({from: investor1, value: 1000});
      var investor = await dao.investors(investor1);
      var share = await dao.shares(investor1);
      var totalShares =  await dao.totalShares();
      var availableFunds = await dao.availableFunds();

      assert(investor == true);
      assert(share == '1000');
      assert(totalShares == '1000');
      assert(availableFunds == '1000');
    });
    it('Should not contribute if contribution ended', async () => {
      await time.increase(31 * 1000);
      await expectRevert(
        dao.contribute({from: investor1, value: 1000}),
        'contribution ended'
      );
    });
  });

  contract('Redeem Share', () => {
    it('Should redeem share', async () => {
      await dao.contribute({from: investor1, value: 1000});
      await dao.redeemShare(1, { from: investor1});

      var share = await dao.shares(investor1);
      var availableFunds = await dao.availableFunds();

      assert(share == '999');
      assert(availableFunds == '999');
    });
    it('Should not redeem if not enough shares', async () => {
      await expectRevert(
        dao.redeemShare(1, { from: investor1}),
        'not enough shares'
      );      
    });
    // it('Should not redeem if not enough shares', async () => {
    //   await dao.contribute({from: investor1, value: 1000});
    //   await dao.contribute({from: investor1, value: 1000});
    //   await expectRevert(
    //     dao.redeemShare(1, { from: investor1}),
    //     'not enough shares'
    //   );      
    // });    
  });

  contract('transferShare', () => {
    it('Should transfer share', async () => {
      await dao.contribute({from: investor1, value: 1000});
      await dao.transferShare(500, investor2, { from: investor1 });

      var share1 = await dao.shares(investor1);
      var share2 = await dao.shares(investor1);

      assert(share1 == '500');
      assert(share2 == '500');
    });
    it('Should not transfer share if not enough shares', async () => {
      await expectRevert(
        dao.transferShare(500, investor2, { from: investor1 }),
        'not enough shares'
      );      
    });
    // it('Should not transfer share if not not enough funds', async () => {
    //   await expectRevert(
    //     dao.transferShare(500, investor2, { from: investor1 }),
    //     'not enough funds'
    //   );      
    // });
  });

  contract('Create Proposal', () => {
    it('Should create proposal', async () => {
      await dao.contribute({from: investor1, value: 1500});
      await dao.createProposal('DAI', 1000, '0x585F6ab6cd8351E3919BB2c7Eed869918DF2ce0E', { from: investor1 });
      var proposal = await dao.proposals(0);
      var availableFunds = await dao.availableFunds(); 

      assert(proposal[0] == '0');
      assert(proposal[1] == 'DAI');
      assert(proposal[2] == '1000');
      assert(proposal[3] == '0x585F6ab6cd8351E3919BB2c7Eed869918DF2ce0E');
      assert(proposal[4] == '0');
      assert(proposal[6] == false);

      assert(availableFunds == '500');
    });
    it('Should not create proposal if amount is too big', async () => {
      await dao.contribute({from: investor1, value: 1500});
      await expectRevert(
        dao.createProposal('DAI', 10000, '0x585F6ab6cd8351E3919BB2c7Eed869918DF2ce0E', { from: investor1 }),
        'amount too big'
      );
    });
  });

  contract('vote', () => {
    it('Should vote', async () => {
      await dao.contribute({from: investor1, value: 1500});
      await dao.contribute({from: investor2, value: 1500});
      await dao.createProposal('DAI', 1000, '0x585F6ab6cd8351E3919BB2c7Eed869918DF2ce0E', { from: investor1 });
      
      await dao.vote(0, { from: investor1});

      var voted = await dao.votes(investor1, 0);
      var proposal = await dao.proposals(0);

      assert(voted == true);
      assert(proposal[4] = '1500');
    });
    it('Should not vote if already voted', async () => {
      await dao.contribute({from: investor1, value: 1500});
      await dao.createProposal('DAI', 1000, '0x585F6ab6cd8351E3919BB2c7Eed869918DF2ce0E', { from: investor1 });

      await dao.vote(0, { from: investor1});

      await expectRevert(
        dao.vote(0, { from: investor1}),
        'has already voted'
      );
    });

    it('Should not vote if proposal ended', async () => {
      await dao.contribute({from: investor1, value: 1500});
      await dao.createProposal('DAI', 1000, '0x585F6ab6cd8351E3919BB2c7Eed869918DF2ce0E', { from: investor1 });

      await time.increase(31 * 1000);

      await expectRevert(
        dao.vote(0, { from: investor1}),
        'proposal ended'
      );
    });
  });

  contract('Execute Proposal', () => {
    it('Should execute proposal', async () => {
      var recipient = '0x585F6ab6cd8351E3919BB2c7Eed869918DF2ce0E';
      var balanceBefore = await web3.eth.getBalance(recipient);
      await dao.contribute({from: investor1, value: 2500});
      await dao.createProposal('DAI', 1000, recipient, { from: investor1 });
      await dao.vote(0, { from: investor1});

      var proposal = await dao.proposals(0);
      var availableFunds = await dao.availableFunds();
      console.log('The amount', proposal[2].toString());
      console.log('availableFunds', availableFunds.toString());

      await time.increase(31 * 1000);

      await dao.executeProposal(0);
      var balanceAfter = await web3.eth.getBalance(recipient);

      assert(web3.utils.toBN(balanceAfter).sub(web3.utils.toBN(balanceBefore)).toString() == '1000');
    });
  });
});