const Lottery = artifacts.require('Lottery.sol');

const { expectRevert } = require('@openzeppelin/test-helpers');

const balances = async (addresses) => {
  const balanceResults = await Promise.all(addresses.map(address => web3.eth.getBalance(address)));
  return balanceResults.map(balance => web3.utils.toBN(balance));
}

contract('Lottery', ([deployer, user1, user2]) => {
  let lottery;

  beforeEach(async () => {
    lottery = await Lottery.new(10);
  });

  context('createBet', () => {
    it('Should create bet', async () => {
      await lottery.createBet(2, 1000);
      var requiredParticipants = await lottery.requiredParticipants();
      var requiredPrice = await lottery.requiredPrice();
      var currentState = await lottery.currentState();

      assert.equal(requiredParticipants, '2');
      assert.equal(requiredPrice, '1000');
      assert.equal(currentState, '1');
    });
    it('Should not create be if not owner', async () => {
      await expectRevert(
        lottery.createBet(2, 1000, { from: user1}),
        'Ownable: caller is not the owner'
      );
    });
  });

  context('Bet', () => {
    it('Should place bet - ongoing', async () => {
      await lottery.createBet(2, 1000);
      await lottery.bet({from: user1, value: 1000});
      var player = await lottery.players(0);
      assert.equal(player, user1);
    })
    it.only('Should place bet - final', async () => {
      await lottery.createBet(2, web3.utils.toWei('1'));

      var players = [user1, user2];

      // var user1BalanceBefore = web3.utils.toBN(await web3.eth.getBalance(user1));
      // var user2BalanceBefore = web3.utils.toBN(await web3.eth.getBalance(user2));
      
      // var tx1 = await lottery.bet({from: user1, value: web3.utils.toWei('1')});
      // var tx2 = await lottery.bet({from: user2, value: web3.utils.toWei('1')});

      // var gas1 = web3.utils.toBN(tx1.receipt.gasUsed);
      // var gas2 = web3.utils.toBN(tx2.receipt.gasUsed);

      // var user1BalanceAfter = web3.utils.toBN(await web3.eth.getBalance(user1));
      // var user2BalanceAfter = web3.utils.toBN(await web3.eth.getBalance(user2));

      var balancesBefore = await balances(players);
      var tx = await Promise.all(players.map(player => lottery.bet({
        from: player, 
        value: web3.utils.toWei('1'),
        gasPrice: 1 // by setting this to 1 the gasUsed in the tx receipt will be equal to the eth used
      })));

      var gas1 = web3.utils.toBN(tx[0].receipt.gasUsed);
      var gas2 = web3.utils.toBN(tx[1].receipt.gasUsed);

      var balancesAfter = await balances(players);

      var result = players.some((player, i) => {
        return balancesAfter[i].gt(balancesBefore[i]);
      })

      var currentState = await lottery.currentState();
      assert.equal(currentState, '0');
      assert.equal(result, true);

      var betWinnings = (parseInt(web3.utils.toWei('1')) * 2) * (100 - 10) / 100; 
      var betWinningsBN = web3.utils.toBN(betWinnings);

      var houseFee = (parseInt(web3.utils.toWei('1')) * 2) * (10) / 100;
      var houseFeeBN = web3.utils.toBN(houseFee);

      console.log('winnings', betWinningsBN.toString());
      console.log('housefee', houseFeeBN.toString());
      console.log('aaa', balancesBefore[0].eq(
        balancesAfter[0]
          .sub(betWinningsBN.div(web3.utils.toBN(players.length)))
          .add(houseFeeBN.div(web3.utils.toBN(players.length)))
          .add(gas1)
      ));

      console.log('bbb', balancesBefore[1].eq(
        balancesAfter[1]
          .sub(betWinningsBN.div(web3.utils.toBN(players.length)))
          .add(houseFeeBN.div(web3.utils.toBN(players.length)))
          .add(gas2)
      ));

      var result2 = balancesBefore[0].eq(
        balancesAfter[0]
            .sub(betWinningsBN.div(web3.utils.toBN(players.length)))
            .add(houseFeeBN.div(web3.utils.toBN(players.length)))
            .add(gas1)
        ) ||
        balancesBefore[1].eq(
          balancesAfter[1]
            .sub(betWinningsBN.div(web3.utils.toBN(players.length)))
            .add(houseFeeBN.div(web3.utils.toBN(players.length)))
            .add(gas2)
        );

      assert.equal(result2, true);

      // assert(
      //   user1BalanceAfter.gt(user1BalanceBefore) ||
      //   user2BalanceAfter.gt(user2BalanceBefore)
      // );
      
      ///------------

      // var betWinnings = (parseInt(web3.utils.toWei('1')) * 2) * (100 - 10) / 100; 
      // var betWinningsBN = web3.utils.toBN(betWinnings);

      // var houseFee = (parseInt(web3.utils.toWei('1')) * 2) * (10) / 100;
      // var houseFeeBN = web3.utils.toBN(houseFee);

      // var b1 = user1BalanceBefore.toString();
      // var a1 = user1BalanceAfter
      //   .sub(betWinningsBN.div(web3.utils.toBN(2)))
      //   .add(houseFeeBN)
      //   .add(gas1).toString();

      // var b2 = user2BalanceBefore.toString();
      // var a2 =  user2BalanceAfter
      //   .sub(betWinningsBN.div(web3.utils.toBN(2)))
      //   .add(houseFeeBN)
      //   .add(gas2).toString();

      // console.log('b1', b1);
      // console.log('a1', a1);
      // console.log('b2', b2);
      // console.log('a2', a2);

      // console.log('aaa', user1BalanceBefore.eq(
      //   user1BalanceAfter
      //     .sub(betWinningsBN.div(web3.utils.toBN(2)))
      //     .add(houseFeeBN)
      //     .add(gas1)
      // ));

      // console.log('bbb', user2BalanceBefore.eq(
      //   user2BalanceAfter
      //     .sub(betWinningsBN.div(web3.utils.toBN(2)))
      //     .add(houseFeeBN)
      //     .add(gas2)
      // ));
      

      
    });
    it('Should not bet if not exact amount', async () => {
      await lottery.createBet(2, 1000);
      await expectRevert(
        lottery.bet({from: user1, value: 1001}),
        'can only send exact amount'
      );
    })
  });

  context('Cancel', () => {
    it('Should cancel bet', async () => {
      await lottery.createBet(2, 1000);
      await lottery.bet({from: user1, value: 1000});

      var user1BalanceBefore = web3.utils.toBN(await web3.eth.getBalance(user1));

      await lottery.cancel();

      var user1BalanceAfter = web3.utils.toBN(await web3.eth.getBalance(user1));

      var currentState = await lottery.currentState(); 
      var player = await lottery.players(0);

      assert.equal(currentState, '0');
      assert.equal(player, '');
      assert.equal(user1BalanceAfter.sub(user1BalanceBefore), '1000');
    });
    it('Should not cancel if not owner', async () => {
      await expectRevert(
        lottery.cancel({from: user1}),
        'can only send exact amount'
      );
    });
  });

});