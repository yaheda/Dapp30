const AdvancedStorage = artifacts.require("advancedStorage");

contract("advancedStorage", function ([deployer]) {
  let advancedStorage;
  beforeEach(async () => {
    advancedStorage =  await AdvancedStorage.deployed();
  });

  contract('Add', () => {
    it('Should operate', async () => {
      await advancedStorage.add(10);
      var res = await advancedStorage.ids(0);
      assert.equal(res, '10')

      var value = await advancedStorage.get(0);
      assert.equal(value, '10');

      var myArray = await advancedStorage.getAll();
      var testArray = myArray.map(id => id.toNumber());
      assert.deepEqual(testArray, [10]);

      var length = await advancedStorage.length();
      assert(length == '1');
    });
    
  })
});
