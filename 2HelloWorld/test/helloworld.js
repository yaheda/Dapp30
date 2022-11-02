const HelloWorld = artifacts.require('HelloWorld.sol');

contract("Hello World", () => {
  it('Should return hello world', async () => {
    var helloWorldInstance = await HelloWorld.deployed();
    var message = await helloWorldInstance.hello();
    assert(message == 'Hello World');
  })
})