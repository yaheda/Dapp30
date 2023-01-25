var ERC20Token = artifacts.require("./ERC20Token.sol");

module.exports = function(deployer, _network, accounts) {
  deployer.deploy(ERC20Token, 'Benzona', 'BZN', 18, 1000000); 
};
