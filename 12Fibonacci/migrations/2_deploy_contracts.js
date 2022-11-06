var Fibonacii = artifacts.require("./Fibonacii.sol");

module.exports = function(deployer) {
  deployer.deploy(Fibonacii); 
};
