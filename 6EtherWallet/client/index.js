import Web3 from 'web3';
import EtherWallet from '../build/contracts/EtherWallet.json';
import detectEthereumProvider from '@metamask/detect-provider'

let web3;
let etherWallet;

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
  //const networkId = Object.keys(Crud.networks)[0];
  return new web3.eth.Contract(
    EtherWallet.abi, 
    EtherWallet
      .networks[networkId]
      .address
  );
};

const processBalance = async () => {
  var balance = await etherWallet.methods.balanceOf().call();
  var eth = web3.utils.fromWei(balance.toString());
  $('#balance').html(`${eth} eth`);
}

const initApp = async () => {

  var accounts = await web3.eth.getAccounts();

  await processBalance();

  $("#deposit").submit(async (e) => {
    e.preventDefault();
    var amount = $('#deposit-amount').val();
    await etherWallet.methods.deposit()
      .send({
        from: accounts[0],
        value: await web3.utils.toWei(amount)
      });

    $('#deposit-result').html(`${amount} eth deposited`);

    await processBalance();
  });

  $("#send").submit(async (e) => {
    e.preventDefault();
    var amount = $('#send-amount').val();
    var to = $('#send-to').val();
    await etherWallet.methods.send(to, await web3.utils.toWei(amount)).send({from: accounts[0]});

    $('#send-result').html(`${amount} eth send to ${to}`);

    await processBalance();
  });
}

$( document ).ready(function() {
  
  initWeb3()
    .then(_web3 => {
      web3 = _web3;
      return initContract();
    })
    .then(_etherWallet => {
      etherWallet = _etherWallet;
      initApp(); 
    })
    .catch(e => console.log(e.message));
});

// document.addEventListener('DOMContentLoaded', () => {
//   debugger;
  
// });
