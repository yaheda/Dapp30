var EventContract = artifacts.require("./EventContract.sol");

module.exports = function(deployer, _network, accounts) {
  deployer.deploy(EventContract); 
};
