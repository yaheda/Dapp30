const Crud = artifacts.require('Crud.sol');

const { expectRevert } = require('@openzeppelin/test-helpers');

contract('Crud', () => {
  let crud;

  beforeEach(async () => {
    crud = await Crud.new();
  });

  contract('create', () => {
    it('Should create', async () => {
      await crud.create('ben');
      var user = await crud.users(0);
      assert(user[1] == 'ben');
    });
  });

  contract('read', () => {
    it('Should read', async () => {
      await crud.create('ben');
      var user = await crud.read(1);
      assert.equal(user[1], 'ben');
    });
    it('Should revert if not found', async () => {
      await expectRevert(
        crud.read(10),
        'user not found'
      );
    });
  })

  contract('update', () => {
    it('Should update', async () => {
      await crud.create('ben');
      await crud.update(1, 'zona');
      var user = await crud.read(1);
      assert(user[1] == 'zona');
    });
    it('Should revert if not found', async () => {
      await expectRevert(
        crud.update(10, 'ben'),
        'user not found'
      );
    });
  });

  contract('delete', () => {
    it('Should delete', async () => {
      await crud.create('ben');
      await crud.create('zona');
      await crud.remove(1);
      var user = await crud.read(2);
      assert(user[1] == 'zona');
    });
    it('Should revert if not found', async () => {
      await expectRevert(
        crud.remove(10),
        'user not found'
      );
    });
  });
});