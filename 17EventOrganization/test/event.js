const EventContract = artifacts.require('EventContract.sol');

const { expectRevert, time } = require('@openzeppelin/test-helpers')

contract('Event Contract', ([admin, user1, user2]) => {
  let eventContract;

  beforeEach(async () => {
    eventContract = await EventContract.new();
  });

  it('Should create event', async () => {
    const date = (await time.latest()).add(time.duration.seconds(1000)); 
    await eventContract.createEvent('event1', date, 5, 2);
    var event = await eventContract.events(0);
    assert(event[0] == admin);
    assert(event[1] == 'event1');
    assert(event[2] == date.toString());
    assert(event[3] == '5');
    assert(event[4] == '2');
    assert(event[5] == '2');
  });
  it('Should not create if date in past', async () => {
    const date = (await time.latest()).sub(time.duration.seconds(1000)); 
    await expectRevert(
      eventContract.createEvent('event1', date, 5, 2),
      'can only be in the future'
    );
  });
  it('Should not create if no tickets', async () => {
    const date = (await time.latest()).add(time.duration.seconds(1000)); 
    await expectRevert(
      eventContract.createEvent('event1', date, 5, 0),
      'at least one ticket required'
    );
  });

  context('buyTicket', () => {
    beforeEach(async () => {
      const date = (await time.latest()).add(time.duration.seconds(1000)); 
      await eventContract.createEvent('event1', date, 5, 2);
    });
    it('Should buy tickets', async () => {
      await eventContract.buyTicket(0, 2, { from: user1, value: 5 * 2 });
      var nTickets = await eventContract.tickets(user1, 0);
      assert(nTickets == '2');
    });
    it('Should not buy if event does not exist', async () => {
      await expectRevert(
        eventContract.buyTicket(1, 2, { from: user1, value: 5 * 2 }),
        'event does not exist'
      );
    });
    it('Should not buy if event not active anymore', async () => {
      await time.increase(1001);
      await expectRevert(
        eventContract.buyTicket(0, 2, { from: user1, value: 5 * 2 }),
        'event not active anymore'
      );
    });
    it('Should not buy if event not exact eth', async () => {
      await expectRevert(
        eventContract.buyTicket(0, 2, { from: user1, value: 4 * 2 }),
        'not exact eth'
      );
    });
    it('Should not buy if event not enough tickets left', async () => {
      await expectRevert(
        eventContract.buyTicket(0, 3, { from: user1, value: 5 * 3 }),
        'not enough tickets left'
      );
    });
  });

  context('Transfer Tickets', () => {
    beforeEach(async () => {
      const date = (await time.latest()).add(time.duration.seconds(1000)); 
      await eventContract.createEvent('event1', date, 5, 2);
      await eventContract.buyTicket(0, 2, { from: user1, value: 5 * 2 });
    });

    it('Should transfer ticket', async () => {
      var user1TicketsBefore = await eventContract.tickets(user1, 0); 
      var user2TicketsBefore = await eventContract.tickets(user2, 0); 

      await eventContract.transferTicket(0, 2, user2, { from: user1 }); 

      var user1TicketsAfter = await eventContract.tickets(user1, 0); 
      var user2TicketsAfter = await eventContract.tickets(user2, 0); 

      assert(user1TicketsAfter == '0');
      assert(user2TicketsAfter == '2');
    });
    it('Should not transfer if event does not exist', async () => {
      await expectRevert(
        eventContract.transferTicket(1, 2, user2, { from: user1 }),
        'event does not exist'
      );
    });
    it('Should not transfer if event not active anymore', async () => {
      await time.increase(1001);
      await expectRevert(
        eventContract.transferTicket(0, 2, user2, { from: user1 }),
        'event not active anymore'
      );
    });
    it('Should not transfer if not enough tickets to sell', async () => {
      await expectRevert(
        eventContract.transferTicket(0, 3, user2, { from: user1 }),
        'not enough tickets to sell'
      );
    });
  })

});