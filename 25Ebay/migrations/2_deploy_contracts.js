const Ebay = artifacts.require("Ebay.sol");

module.exports = async function(deployer) {
  await deployer.deploy(Ebay);
  const game = await Ebay.deployed();
};
