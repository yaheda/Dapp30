import Web3 from 'web3';
import SplitPayment from '../build/contracts/SplitPayment.json';
import detectEthereumProvider from '@metamask/detect-provider';

let web3;
let splitPayment;

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
    SplitPayment.abi, 
    SplitPayment
      .networks[networkId]
      .address
  );
};

const initApp = async () => {
  var accounts = await web3.eth.getAccounts();

  $('#send').submit(async e => {
    e.preventDefault();

    var to = $('#send-to').val();
    var amounts = $('#send-amount').val();

    var toArray = to.split(',');
    var toAmount = amounts.split(',').map(ethamount => {
      return web3.utils.toWei(ethamount);
    });

    try {
      await splitPayment.methods.send(toArray, toAmount).send({ from: accounts[0], value: web3.utils.toWei('20')});
    } catch(e) {
      console.log(e);
      $('#send-result').html('Error sending');
      return;
    }

    $('#send-result').html('Sent');

  })
};


document.addEventListener('DOMContentLoaded', () => {
  initWeb3()
    .then(_web3 => {
      web3 = _web3;
      return initContract();
    })
    .then(_splitPayment => {
      splitPayment = _splitPayment;
      initApp(); 
    })
    .catch(e => console.log(e.message));
});
