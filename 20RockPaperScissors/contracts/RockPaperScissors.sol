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
    address payable[2] players;
    State state;
  }

  mapping(uint => Game) public games;
  uint public gameId;
  mapping(uint => mapping(address => Move)) public moves;

  /// commit reveal pattern
  /// produce hash in 1st step --> then on reveal phase you reveal move
  /// smart contract will hash move and compare with hash in commit phase to confirm
  struct Move {
    bytes32 hash;
    uint value;
  }

  function createGame(address payable participant) external payable {
    require(msg.value > 0, 'need to send some ether');
    address payable[2] memory players;
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
    require(moves[_gameId][msg.sender].hash != 0, 'move already made');
    require(moveId == 1 || moveId == 2 || moveId == 3, 'move must be 1 or 2 or 3');

    moves[_gameId][msg.sender] = Move(
      keccak256(abi.encodePacked(moveId, salt)), 
      0
    );

    if (moves[_gameId][game.players[0]].hash != 0 && 
      moves[_gameId][game.players[1]].hash != 0) {
      game.state == State.COMMITED;
    }
  }
}