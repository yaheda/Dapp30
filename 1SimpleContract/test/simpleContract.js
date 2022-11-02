const SimpleContract = artifacts.require('SimpleContract.sol');

contract('SimpleContract', async () => {
  it("Should display an address", async () => {
    const simpleContractInstance = await SimpleContract.new();
    assert(simpleContractInstance.address != '');
  });
});