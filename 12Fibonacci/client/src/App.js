import React, { useEffect, useState } from 'react';
import Fibonacii from './contracts/Fibonacii.json';
import { getWeb3 } from './utils.js';

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [fibN, setFibN] = useState(undefined); 
  const [result, setResult] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Fibonacii.networks[networkId];
      const contract = new web3.eth.Contract(
        Fibonacii.abi,
        deployedNetwork && deployedNetwork.address,
      );
      setWeb3(web3);
      setContract(contract);
    }
    init();
  }, []);
  if (!web3) {
    return <div>Loading...</div>;
  }

  async function calculateFib(e) {
    e.preventDefault();
    try {
      var fib = await contract.methods.fib(parseInt(fibN)).call();
      setResult(fib);
    } catch(e) {
      console.log(e);
      debugger;
    }
    
  }

  return (
    <div className="container">
      <h1 className="text-center">Fibonacci</h1>

      <div className="row">
        <div className="col-sm-12">
          <form onSubmit={e => calculateFib(e)}>
            <div className="form-group">
              <label htmlFor="number">Fibonacci sequence of</label>
              <input onChange={e => setFibN(e.target.value)} type="number" className="form-control" id="number" />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
            <p>{result && `Result: ${result}`}</p>
          </form>
        </div>
      </div>

    </div>
  );
}

export default App;
