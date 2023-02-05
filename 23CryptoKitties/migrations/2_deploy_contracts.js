var CryptoKitty = artifacts.require("./CryptoKitty.sol");

module.exports = function(deployer, _network, accounts) {
  deployer.deploy(CryptoKitty, 'BenZona', 'BZ', 'www.benzona.com'); 
};
