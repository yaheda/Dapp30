// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract EventContract {
  
  struct Event {
    address admin;
    string name;
    uint date;
    uint price;
    uint ticketCount;
    uint ticketRemaining;
  }

  mapping(uint => Event) public events;
  uint public nextId;
  // customer ==> eventID ==> number of tickets
  mapping(address => mapping(uint => uint)) public tickets;

  function createEvent(
    string calldata name,
    uint date,
    uint price,
    uint ticketCount
  ) external {
    require(date > block.timestamp, 'can only be in the future');
    require(ticketCount > 0, 'at least one ticket required');
    events[nextId] = Event(
      msg.sender,
      name,
      date,
      price,
      ticketCount,
      ticketCount
    );
    nextId++;
  }

  function buyTicket(uint id, uint quantity) external payable {
    Event storage _event = events[id];
    require(_event.ticketCount != 0, 'event does not exist');
    require(_event.date > block.timestamp, 'event not active anymore');
    require(_event.price * quantity == address(this).balance, 'not exact eth');
    require(_event.ticketRemaining >= quantity, 'not enough tickets left');
    _event.ticketRemaining -= quantity;
    tickets[msg.sender][id] += quantity;
  }

}