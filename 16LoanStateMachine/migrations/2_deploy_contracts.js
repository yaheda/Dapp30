var StateMachine = artifacts.require("./StateMachine.sol");

module.exports = function(deployer, _network, accounts) {
  deployer.deploy(StateMachine, 1000, 10, 30, accounts[0], accounts[1]); 
};
