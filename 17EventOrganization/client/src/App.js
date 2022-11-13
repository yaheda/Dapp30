import React, { useEffect, useState } from 'react';
import EventContract from './contracts/EventContract.json';
import { getWeb3 } from './utils.js';

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = EventContract.networks[networkId];
      const contract = new web3.eth.Contract(
        EventContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      setWeb3(web3);
      setAccounts(accounts);
      setContract(contract);
    }
    init();
    window.ethereum.on('accountsChanged', accounts => {
      setAccounts(accounts);
    });
  }, []);

  const isReady = () => {
    return (
      typeof contract !== 'undefined' 
      && typeof web3 !== 'undefined'
      && typeof accounts !== 'undefined'
    );
  }

  useEffect(() => {
    if(isReady()) {
      updateEvents();
    }
  }, [accounts, contract, web3]);

  async function updateEvents() {
    var nEvents = await contract.methods.nextId().call();
    var events = [];
    for(var i = 0; i < nEvents; i++) {
      var event = await contract.methods.events(i).call();
      events.push({...event, id: i});
    }
    setEvents(events);
  }

  async function transferTicket(e) {
    e.preventDefault();
    var eventID = e.target.elements[0].value;
    var amount = e.target.elements[1].value;
    var recipient = e.target.elements[2].value;
    await contract.methods.transferTicket(eventID, amount, recipient).send({from: accounts[0]})
  };

  async function buyTicket(e, event) {
    e.preventDefault();
    var quatity = parseInt(e.target.elements[0].value);
    await contract.methods.buyTicket(event.id, quatity).send({from:accounts[0], value: event.price * quatity});
  };

  async function createEvent(e) {
    e.preventDefault();
    var name = e.target.elements[0].value;
    var date = e.target.elements[1].value;
    var price = e.target.elements[2].value;
    var ticketCount = e.target.elements[3].value;
    
    await contract.methods.createEvent(
      name,
      parseInt((new Date(date)).getTime() / 1000),
      parseInt(price),
      parseInt(ticketCount)
    ).send({from: accounts[0]});
  };

  function isFinished(event) {
    const now = new Date().getTime();
    const eventEnd =  (new Date(parseInt(event.date) * 1000)).getTime();
    return (eventEnd > now) ? false : true;
  }

  if (!isReady()) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1 className="text-center">Event Organization</h1>

      <div className="row">
        <div className="col-sm-12">
          <h2>Create event</h2>
          <form onSubmit={e => createEvent(e)}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" className="form-control" id="name" />
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input type="date" className="form-control" id="date" />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input type="text" className="form-control" id="price" />
            </div>
            <div className="form-group">
              <label htmlFor="ticketCount">Ticket count</label>
              <input type="text" className="form-control" id="ticketCount" />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>

      <hr/>

      <div className="row">
        <div className="col-sm-12">
          <h2>Transfer tickets</h2>
          <form onSubmit={e => transferTicket(e)}>
            <div className="form-group">
              <label htmlFor="eventId">Event Id</label>
              <input type="text" className="form-control" id="eventId" />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input type="text" className="form-control" id="amount" />
            </div>
            <div className="form-group">
              <label htmlFor="to">To</label>
              <input type="text" className="form-control" id="to" />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>

      <hr/>

      <div className="row">
        <div className="col-sm-12">
          <h2>Events</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Admin</th>
                <th>Name</th>
                <th>Date</th>
                <th>Price</th>
                <th>Ticket remaining</th>
                <th>Total tickets</th>
                <th>Buy</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td>{event.id}</td>
                  <td>{event.admin}</td>
                  <td>{event.name}</td>
                  <td>
                    {(new Date(parseInt(event.date) * 1000)).toLocaleString()}
                  </td>
                  <td>{event.price}</td>
                  <td>{event.ticketRemaining}</td>
                  <td>{event.ticketCount}</td>
                  <td>
                    {isFinished(event) ? 'Event finished' : (
                      <form onSubmit={e => buyTicket(e, event)}>
                        <div className="form-group">
                          <label htmlFor="amount">Amount</label>
                          <input type="text" className="form-control" id="amount" />
                        </div>
                        <button type="submit" className="btn btn-primary">Submit</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
