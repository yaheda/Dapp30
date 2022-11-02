var simpleStorageABI = [
  {
    "inputs": [],
    "name": "data",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_data",
        "type": "string"
      }
    ],
    "name": "setData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getData",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];
var simpleStorageAddress = '0x64eaF0039ed08F5aaF0aF324349E378D4676f76B';
var web3 = new Web3('http://localhost:7545');
var simpleStorage = new web3.eth.Contract(simpleStorageABI, simpleStorageAddress);

document.addEventListener('DOMContentLoaded', async () => {

  const getData = async () => {
    var data = await simpleStorage.methods.getData().call();
    document.getElementById('data').innerHTML = data;
  };
  getData();
  

  document.getElementById('setData').addEventListener('submit', async (e) => {
    e.preventDefault();

    let accounts = await web3.eth.getAccounts();
    var text = document.getElementById('setDataInput').value;
    await simpleStorage.methods.setData(text).send({ from: accounts[0]});

    getData();
  })
});

