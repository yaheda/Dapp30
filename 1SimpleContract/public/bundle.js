var contractABI = [];
var contractAdress = '0x249C7C65ee4CA385E95a050909212446d3F18056';
var web3 = new Web3('http://localhost:7545');
var simpleContract = new web3.eth.Contract(contractABI, contractAdress);
console.log(simpleContract);

web3.eth.getAccounts().then(console.log);