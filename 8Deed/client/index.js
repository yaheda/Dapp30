import Web3 from 'web3';
import Deed from '../build/contracts/Deed.json';
import detectEthereumProvider from '@metamask/detect-provider';

let web3;
let deed;

const initWeb3 = () => {
  return new Promise(async (resolve, reject) => {
    /// Case 1: old metamask
    /// Case 2: new metamask
    /// Case 3: no metamask

    let provider = await detectEthereumProvider()
    if (provider) {
      await provider.request({ method: 'eth_requestAccounts' });

      try {
        const web3 = new Web3(window.ethereum);
        resolve(web3);
        return;
      } catch (error) {
        reject(error);
      }
    }

    if (typeof window.web3 !== 'undefined') {
      return resolve(new Web3(window.web3.currentProvider));
    }

    resolve(new Web3('http://localhost:7545'));
  });
};

const initContract = async () => {
  const networkId = await web3.eth.net.getId();
  return new web3.eth.Contract(
    Deed.abi, 
    Deed
      .networks[networkId]
      .address
  );
};


const initApp = async () => {
  var accounts = await web3.eth.getAccounts();

  var balance = await web3.eth.getBalance(deed.options.address);
  $('#balance').html(balance.toString());

  $('#withdraw').submit(async e => {
    e.preventDefault();

    try {
      await deed.methods.withdraw().send({from: accounts[0]});
      $('#withdraw-result').html('Balance withdrawn');
    } catch(e) {
      console.log(e);
      $('#withdraw-result').html('Error withdrawing');
    }
  })
};

document.addEventListener('DOMContentLoaded', () => {
  initWeb3()
    .then(_web3 => {
      web3 = _web3;
      return initContract();
    })
    .then(_deed => {
      deed = _deed;
      initApp(); 
    })
    .catch(e => console.log(e.message));
});
