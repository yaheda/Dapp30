var DAO = artifacts.require("./DAO.sol");

module.exports = function(deployer, _network, accounts) {
  deployer.deploy(DAO, 30, 30, 66); 
};
