const Deed = artifacts.require("Deed");

module.exports = function(deployer, networks, accounts) {
  deployer.deploy(Deed, accounts[0], accounts[1], 60, { value: 100});
};
