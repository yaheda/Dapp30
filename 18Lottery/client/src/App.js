import React, { useEffect, useState } from 'react';
import Lottery from './contracts/Lottery.json';
import { getWeb3 } from './utils.js';

const states = ['IDLE', 'BETTING'];

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [bet, setBet] = useState({});
  const [players, setPlayers] = useState([]);
  const [houseFee, setHouseFee] = useState(undefined);
  const [owner, setOwner] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Lottery.networks[networkId];
      const contract = new web3.eth.Contract(
        Lottery.abi,
        deployedNetwork && deployedNetwork.address,
      );

      const [houseFee, state, owner] = await Promise.all([
        contract.methods.houseFee().call(),
        contract.methods.currentState().call(),
        contract.methods.owner().call()
      ]);
      
      setWeb3(web3);
      setAccounts(accounts);
      setContract(contract);
      setHouseFee(houseFee);
      setBet({state: 0});
      setOwner(owner);
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
      && typeof houseFee !== 'undefined'
    );
  }

  useEffect(() => {
    if(isReady()) {
      updateBet();
      updatePlayers();
    }
  }, [accounts, contract, web3, houseFee]);

  async function updateBet() {
    const [requiredParticipants, requiredPrice, state] = await Promise.all([
      contract.methods.requiredParticipants().call(),
      contract.methods.requiredPrice().call(),
      contract.methods.currentState().call()
    ]);

    setBet({
      requiredParticipants: requiredParticipants,
      requiredPrice: requiredPrice,
      state: state
    });
  }

  async function updatePlayers() {
    var nPlayers = await contract.methods.requiredParticipants().call();
    var players = [];
    for(var i = 0; i < parseInt(nPlayers); i++) {
      try {
        var player = await contract.methods.players(i).call();
        players.push(player);
      } catch(e){}
      
    }
    

    setPlayers(players);
    
  }

  function displayPlayers() {
    //return <>ben zona</>
    return players.map(player => <li>{player}</li>)
  }

  async function createBet(e) {
    e.preventDefault();

    var count = e.target.elements[0].value;
    var size = e.target.elements[1].value;

    await contract.methods.createBet(parseInt(count), parseInt(size)).send({from: accounts[0]});
  };

  async function cancel() {
  };

  async function doBet() {
    //e.preventDefault();

    await contract.methods.bet().send({from: accounts[0], value: 1000});
  };

  if(!bet || typeof bet.state === 'undefined') {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1 className="text-center">Lottery</h1>

      <p>House Fee: {houseFee} %</p>
      <p>State: {states[bet.state]}</p>

      {states[bet.state] == 'BETTING' && <>
        <p>Required Participants: {bet.requiredParticipants}</p>
          <p>Required Price: { bet.requiredPrice }</p>
          <div>
            <h2>Players</h2>
            <ul>
              {/* display list of players */}
              {displayPlayers()}
            </ul>
          </div>
      </>}

      {/* display only if bet state is 0 */}

      {states[bet.state] == 'IDLE' && <>
        <div className="row">
          <div className="col-sm-12">
            <h2>Create bet</h2>
            <form onSubmit={e => createBet(e)}>
              <div className="form-group">
                <label htmlFor="count">Count</label>
                <input type="text" className="form-control" id="count" />
              </div>
              <div className="form-group">
                <label htmlFor="size">Size</label>
                <input type="text" className="form-control" id="size" />
              </div>
              <button type="submit" className="btn btn-primary">Submit</button>
            </form>
          </div>
        </div>

      </>}
        
      {/* display only if bet state is 1 AND this is the admin */}

      {states[bet.state] == 'BETTING' && accounts[0] == owner && <>
        <div className="row">
          <div className="col-sm-12">
            <h2>Cancel bet</h2>
              <button 
                onClick={e => cancel()}
                type="submit" 
                className="btn btn-primary"
              >
                Submit
              </button>
          </div>
        </div>
      </>}
        

      {/* display only if bet state is 1 */}
      {states[bet.state] == 'BETTING' && <>
        <div className="row">
          <div className="col-sm-12">
            <h2>Bet</h2>
              <button 
                onClick={e => doBet()}
                type="submit" 
                className="btn btn-primary"
              >
                Submit
              </button>
          </div>
        </div>
      </>}
        
      
    </div>
  );
}

export default App;
