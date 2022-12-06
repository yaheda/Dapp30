var RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

module.exports = function(deployer, _network, accounts) {
  deployer.deploy(RockPaperScissors); 
};
