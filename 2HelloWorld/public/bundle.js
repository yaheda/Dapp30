var contractABI = [
  {
    "inputs": [],
    "name": "hello",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
    "type": "function",
    "constant": true
  }
];
var contractAddress = '0xbB5671141752Cf2d875174E942b699724c8dD394';
var web3 = new Web3('http://localhost:7545');
var helloInstance = new web3.eth.Contract(contractABI, contractAddress);

document.addEventListener('DOMContentLoaded', () => {
  helloInstance.methods.hello().call()
    .then(x => {
      document.getElementById('hello').innerHTML = x;
    })
})
