import Web3 from 'web3';
import Crud from '../build/contracts/Crud.json';
import detectEthereumProvider from '@metamask/detect-provider'

let web3;
let crud;

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
  const deploymentKey = Object.keys(Crud.networks)[0];
  return new web3.eth.Contract(
    Crud.abi, 
    Crud
      .networks[deploymentKey]
      .address
  );
};

const initApp = async () => {
  var $createForm = document.getElementById('create');
  var $createResult = document.getElementById('create-result');

  let accounts = await web3.eth.getAccounts();

  $createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = e.target.elements[0].value;

    try {
      await crud.methods.create(data).send({from:accounts[0]});
      $createResult.innerHTML = data + ' created';
    } catch(e) {
      $createResult.innerHTML = 'Error creating'
    }
    
  });


  var $readForm = document.getElementById('read');
  var $readResult = document.getElementById('read-result');

  $readForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const readId = e.target.elements[0].value;

    try {
      var result = await crud.methods.read(readId).call();
      $readResult.innerHTML = `id: ${result[0]}, name: ${result[1]}`;
    } catch (e) {
      $readResult.innerHTML = 'Error reading';
    }
    
  });

  var $editForm = document.getElementById('edit');
  var $editResult = document.getElementById('edit-result');
  $editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.elements[0].value;
    const name = e.target.elements[1].value;

    try {
      var result = await crud.methods.update(id, name).send({from:accounts[0]});
      $editResult.innerHTML = `id: ${result[0]}, name: ${result[1]} updated`;
    } catch (e) {
      $editResult.innerHTML = 'Error updating';
    }
    
  });

  var $deleteForm = document.getElementById('delete');
  var $deleteResult = document.getElementById('delete-result');
  $deleteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.elements[0].value;

    try {
      var result = await crud.methods.remove(id).send({from:accounts[0]});
      $deleteResult.innerHTML = `id: ${result[0]}, name: ${result[1]}`;
    } catch(e) {
      $deleteResult.innerHTML = 'Error deleting';
    }
    
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initWeb3()
    .then(_web3 => {
      web3 = _web3;
      crud = initContract();
      initApp(); 
    })
    .catch(e => console.log(e.message));
});
