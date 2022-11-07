import React, { useEffect, useState } from 'react';
import MultiSig from './contracts/MultiSig.json';
import { getWeb3 } from './utils.js';

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contract, setContract] = useState(undefined);

  const [balance, setBalance] = useState(undefined);
  const [currentTransfer, setCurrentTransfer] = useState(undefined);
  const [quorum, setQuorum] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = MultiSig.networks[networkId];
      const contract = new web3.eth.Contract(
        MultiSig.abi,
        deployedNetwork && deployedNetwork.address,
      );

      const quorum = await contract.methods.quorum().call();
      setQuorum(quorum);

      setWeb3(web3);
      setAccounts(accounts);
      setContract(contract);
    }
    init();

    window.ethereum.on('accountsChanged', (accounts) => {
      setAccounts(accounts);
    })
  }, []);

  useEffect(() => {
    var use = () => {
      if (typeof contract != 'undefined' && typeof web3 != 'undefined') {
        updateBalance();
        updateCurrentTransfer();
      }
    }
    use();
    
  }, [accounts, contract, web3]);

  if (!web3) {
    return <div>Loading...</div>;
  }

  async function updateBalance() {
    const balance = await web3.eth.getBalance(contract.options.address)
    setBalance(balance);
  }

  

  async function createTransfer(e) {
    e.preventDefault();

    var amount = e.target.elements[0].value;
    var to = e.target.elements[1].value;

    await contract.methods.createTransfer(amount, to).send({from: accounts[0]});

    await updateCurrentTransfer();
  }

  async function updateCurrentTransfer() {
    var currentTransferId = await contract.methods.nextId().call() - 1;
    if (currentTransferId >= 0) {
      var currentTransfer = await contract.methods.transfers(currentTransferId).call();
      var alreadyApproved = await contract.methods.approved(accounts[0], currentTransferId).call();
      setCurrentTransfer({...currentTransfer, alreadyApproved});
    }
  }

  async function approveTransfer(e) {
    await contract.methods.Approve(currentTransfer.id).send({from: accounts[0]});
    await updateBalance();
    await updateCurrentTransfer();
  }

  return (
    <div className="container">
      <h1 className="text-center">Multisig</h1>

      <div className="row">
        <div className="col-sm-12">
           <p>Balance: <b>{balance}</b> wei </p>
        </div>
      </div>
      {!currentTransfer || currentTransfer.approvals >= quorum ? (
        <div className="row">
        <div className="col-sm-12">
          <h2>Create transfer</h2>
          <form onSubmit={e => createTransfer(e)}>
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input type="number" className="form-control" id="amount" />
            </div>
            <div className="form-group">
              <label htmlFor="to">To</label>
              <input type="text" className="form-control" id="to" />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
      ) : (
        <div className="row">
          <div className="col-sm-12">
            <h2>Approve transfer</h2>
            <ul>
              <li>TransferId: {currentTransfer.id}</li>
              <li>Amount: {currentTransfer.amount}</li>
              <li>Approvals: {currentTransfer.approvals}</li>
            </ul>
            {currentTransfer.alreadyApproved ? 'Already approved' : 
              <button onClick={e => approveTransfer(e)}
                type="submit" 
                className="btn btn-primary"
              >Submit</button>
            }
            
          </div>
        </div>
      )}
        

        
    </div>
  );
}

export default App;
