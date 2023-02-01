var ERC721Token = artifacts.require("./ERC721Token.sol");

module.exports = function(deployer, _network, accounts) {
  deployer.deploy(ERC721Token); 
};
