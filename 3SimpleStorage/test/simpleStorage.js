const SimpleStorage = artifacts.require('SimpleStorage.sol');

contract('SimpleStorage', () => {
  let simpleInstance;

  beforeEach(async () => {
    simpleInstance = await SimpleStorage.deployed();
  })

  contract('getData', () => {
    it('Should return data', async () => {
      var data = await simpleInstance.getData();
      assert.equal(data, 'my data');
    });
  })

  contract('setData', () => {
    it('Should set data', async () => {
      await simpleInstance.setData('benzona');
      var data = await simpleInstance.getData();
      assert.equal(data, 'benzona');
    })
  })
})