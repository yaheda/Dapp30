const Twitter = artifacts.require("Twitter.sol");

module.exports = async function(deployer, _network, accounts) {
  await deployer.deploy(Twitter);
  let instance = await Twitter.deployed();
  await instance.sendTweet('first tweet', { from: accounts[0]})
};
