import Web3 from 'web3';
import AdvancedStorage from '../build/contracts/AdvancedStorage.json';
import detectEthereumProvider from '@metamask/detect-provider'

var web3;
var advancedStorage;

const initWeb3 = async () => {
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

const initContract = () => {
  var deploymentKey = Object.keys(AdvancedStorage.networks)[0];

  return new web3.eth.Contract(
    AdvancedStorage.abi, 
    AdvancedStorage.networks[deploymentKey].address
  );
};

const initApp = async () => {
  const $addData = document.getElementById('addData');
  const $data = document.getElementById('data');
  
  let accounts = await web3.eth.getAccounts();

  var rawIds = await advancedStorage.methods.getAll().call();
  $data.innerHTML = rawIds.join(', ');

  addData.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = e.target.elements[0].value;
    await advancedStorage.methods.add(data).send({ from: accounts[0] });

    var rawIds = await advancedStorage.methods.getAll().call();
    $data.innerHTML = rawIds.join(', ');
  })
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    web3 = await initWeb3();
    advancedStorage = initContract();
    initApp();
  } catch(error) {
    console.log(error);
  }
  
})

