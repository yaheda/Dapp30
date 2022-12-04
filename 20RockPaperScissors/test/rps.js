const RockPaperScissors = artifacts.require('RockPaperScissors.sol');

const { expectRevert } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

const State = ['CREATED', 'JOINED', 'COMMITED', 'REVEALED'];
const [salt1, salt2] = [10, 20];
const [rock, paper, scissors] = [1, 2, 3]; 

contract('RockPaperScissors', ([player1, player2, player3]) => {
  let rockPaperScissors;

  beforeEach(async () => {
    rockPaperScissors = await RockPaperScissors.new();
  });

  context('Create Game', () => {
    it('Should create game', async () => {
      await rockPaperScissors.createGame(player2, { from: player1, value: web3.utils.toWei('1')});
      var game = await rockPaperScissors.games(0);
      assert.equal(game.bet, web3.utils.toWei('1'));
      assert.equal(State[parseInt(game.state.toString())], 'CREATED');
      //assert.equal(game.players[0], player1);
      //assert.equal(game.players[1], player2);
    });
    it('Should create game with no money', async () => {
      await expectRevert(
        rockPaperScissors.createGame(player2),
        'need to send some ether'
      );
    });
  });

  context('Join Game', () => {
    it('Should join game', async () => {
      await rockPaperScissors.createGame(player2, { from: player1, value: web3.utils.toWei('1')});
      await rockPaperScissors.joinGame(0, { from: player2, value: web3.utils.toWei('1') });
      var game = await rockPaperScissors.games(0);
      assert.equal(State[parseInt(game.state.toString())], 'JOINED');
    });
    it('Should not join game if player is not registered', async () => {
      await rockPaperScissors.createGame(player2, { from: player1, value: web3.utils.toWei('1')});
      await expectRevert(
        rockPaperScissors.joinGame(0, { from: player3, value: web3.utils.toWei('1') }),
        'is not second player'
      );
    });
    it('Should not join if no in create state', async () => {
      await rockPaperScissors.createGame(player2, { from: player1, value: web3.utils.toWei('1')});
      await rockPaperScissors.joinGame(0, { from: player2, value: web3.utils.toWei('1') });
      await expectRevert(
        rockPaperScissors.joinGame(0, { from: player2, value: web3.utils.toWei('1') }),
        'must be in CREATE state'
      );
    });
    it('Should not join game if player is not registered', async () => {
      await rockPaperScissors.createGame(player2, { from: player1, value: web3.utils.toWei('1')});
      await expectRevert(
        rockPaperScissors.joinGame(0, { from: player2, value: web3.utils.toWei('10') }),
        'not enough ether sent'
      );
    });
  });

  context('Commit Move', () => {
    it('Should commit move', async () => {
      await rockPaperScissors.createGame(player2, { from: player1, value: web3.utils.toWei('1')});
      await rockPaperScissors.joinGame(0, { from: player2, value: web3.utils.toWei('1') });
      await rockPaperScissors.commitMove(0, rock, salt1, { from: player1 });
      await rockPaperScissors.commitMove(0, paper, salt2, { from: player2 });

      var game = await rockPaperScissors.games(0);
      assert.equal(State[parseInt(game.state.toString())], 'COMMITED');
    });
    it('Sould not commit move if state is no in join', async () => {
      await expectRevert(
        rockPaperScissors.commitMove(0, rock, salt1, { from: player1 }),
        'must be in JOINED state'
      );
    });
    it('Should not commit move if not a player', async () => {
      await rockPaperScissors.createGame(player2, { from: player1, value: web3.utils.toWei('1')});
      await rockPaperScissors.joinGame(0, { from: player2, value: web3.utils.toWei('1') });
      await expectRevert(
        rockPaperScissors.commitMove(0, rock, salt1, { from: player3 }),
        'can only be a player'
      );
    });
    it('Should not commit move if move already made', async () => {
      await rockPaperScissors.createGame(player2, { from: player1, value: web3.utils.toWei('1')});
      await rockPaperScissors.joinGame(0, { from: player2, value: web3.utils.toWei('1') });
      await rockPaperScissors.commitMove(0, rock, salt1, { from: player1 });  
      await expectRevert(
        rockPaperScissors.commitMove(0, rock, salt1, { from: player1 }),
        'move already made'
      );
    });
    it('Should not commit if not 1,2,3', async () => {
      await rockPaperScissors.createGame(player2, { from: player1, value: web3.utils.toWei('1')});
      await rockPaperScissors.joinGame(0, { from: player2, value: web3.utils.toWei('1') });
      await expectRevert(
        rockPaperScissors.commitMove(0, 4, salt1, { from: player1 }),
        'move must be 1 or 2 or 3'
      );
    });
  });

  context('Reveal Move', () => {
    it('Should reveal move', async () => {
      var ethAmount = web3.utils.toWei('1')
      await rockPaperScissors.createGame(player2, { from: player1, value: ethAmount});
      await rockPaperScissors.joinGame(0, { from: player2, value: ethAmount });
      
      await rockPaperScissors.commitMove(0, rock, salt1, { from: player1 });
      await rockPaperScissors.commitMove(0, paper, salt2, { from: player2 });

      var player1BalanceBefore = web3.utils.toBN(await web3.eth.getBalance(player1));
      var player2BalanceBefore = web3.utils.toBN(await web3.eth.getBalance(player2));

      var tx1 = await rockPaperScissors.revealMove(0, rock, salt1, { from: player1, gasPrice: 1  });
      var tx2 = await rockPaperScissors.revealMove(0, paper, salt2, { from: player2, gasPrice: 1 });

      var gas1 = web3.utils.toBN(tx1.receipt.gasUsed);
      var gas2 = web3.utils.toBN(tx2.receipt.gasUsed);

      var player1BalanceAfter = web3.utils.toBN(await web3.eth.getBalance(player1));
      var player2BalanceAfter = web3.utils.toBN(await web3.eth.getBalance(player2));

      var ethAmountBN = web3.utils.toBN(ethAmount);

      var player1Result = player1BalanceAfter.sub(player1BalanceBefore).add(gas1).isZero();
      var player2Result = player2BalanceAfter.sub(player2BalanceBefore).add(gas2).eq(ethAmountBN.add(ethAmountBN));

      var game = await rockPaperScissors.games(0);
      assert.equal(State[parseInt(game.state.toString())], 'REVEALED');
      assert.equal(player1Result, true);
      assert.equal(player2Result, true);
    });
  })
});