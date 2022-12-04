// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/Address.sol';

contract RockPaperScissors {
  using Address for address payable;

  enum State {
    CREATED,
    JOINED,
    COMMITED,
    REVEALED
  }

  struct Game {
    uint id;
    uint bet;
    address payable[] players;
    State state;
  }

  mapping(uint => Game) public games;
  uint public gameId;
  mapping(uint => mapping(address => Move)) public moves;
  mapping(uint => uint) public winningMoves;

  /// commit reveal patt
  /// produce hash in 1st step --> then on reveal phase you reveal move
  /// smart contract will hash move and compare with hash in commit phase to confirm
  struct Move {
    bytes32 hash;
    uint value;
  }

  constructor() {
    // 1. rock
    // 2. papper
    // 3. scissors
    winningMoves[1] = 3;
    winningMoves[2] = 1;
    winningMoves[3] = 2;
  }

  function createGame(address payable participant) external payable {
    require(msg.value > 0, 'need to send some ether');
    //address payable[2] memory players = new address payable[](2);
    address payable[] memory players = new address payable[](2);
    players[0] = payable(msg.sender);
    players[1] = participant;

    games[gameId] = Game(
      gameId,
      msg.value,
      players,
      State.CREATED
    );

    gameId++;
  }

  function joinGame(uint _gameId) external payable {    
    Game storage game = games[_gameId];

    require(game.players[1] == msg.sender, 'is not second player');
    require(game.state == State.CREATED, 'must be in CREATE state');
    require(game.bet == msg.value, 'not enough ether sent');

    game.state = State.JOINED;
  }

  function commitMove(uint _gameId, uint moveId, uint salt) external {
    Game storage game = games[_gameId];

    require(game.state == State.JOINED, 'must be in JOINED state');
    require(game.players[0] == msg.sender || game.players[1] == msg.sender, 'can only be a player');
    require(moves[_gameId][msg.sender].hash == 0, 'move already made');
    require(moveId == 1 || moveId == 2 || moveId == 3, 'move must be 1 or 2 or 3');

    moves[_gameId][msg.sender] = Move(
      keccak256(abi.encodePacked(moveId, salt)), 
      0
    );

    if (moves[_gameId][game.players[0]].hash != 0 && 
      moves[_gameId][game.players[1]].hash != 0) {
      game.state = State.COMMITED;
    }
  }

  function revealMove(uint _gameId, uint moveId, uint salt) external {
    Game storage game = games[_gameId];
    Move storage move1 = moves[_gameId][game.players[0]];
    Move storage move2 = moves[_gameId][game.players[1]];
    Move storage moveSender = moves[_gameId][msg.sender];

    require(game.state == State.COMMITED, 'must be in COMMITED state');
    require(game.players[0] == msg.sender || game.players[1] == msg.sender, 'can only be a player');
    require(moveId == 1 || moveId == 2 || moveId == 3, 'move must be 1 or 2 or 3');
    require(moveSender.hash == keccak256(abi.encodePacked(moveId, salt)), 'moveid does not match commitment');

    moveSender.value = moveId;

    if (move1.value != 0 && move2.value != 0) {
      if (move1.value == move2.value) {
        payable(game.players[0]).sendValue(game.bet);
        payable(game.players[1]).sendValue(game.bet);
        game.state = State.REVEALED;
        return;
      }

      address payable winner;
      winner = winningMoves[move1.value] == move2.value ? game.players[0] : game.players[1];
      payable(winner).sendValue(game.bet * 2);
      game.state = State.REVEALED;
    }
  }
}