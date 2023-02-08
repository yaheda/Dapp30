const Twitter = artifacts.require("Twitter.sol");

module.exports = async function(deployer) {
  await deployer.deploy(Twitter);
};
