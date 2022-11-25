var Lottery = artifacts.require("./Lottery.sol");

module.exports = function(deployer, _network, accounts) {
  deployer.deploy(Lottery, 10); 
};
