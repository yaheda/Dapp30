const Fibonacci = artifacts.require('Fibonacii.sol');

contract('Fibonacii', () => {
  let fibonacii;

  beforeEach(async () => {
    fibonacii = await Fibonacci.new();
  });

  contract('fib', () => {
    it('should return fib 0', async () => {
      var fib = await fibonacii.fib(0);
      assert(fib = '0');
    });
    it('should return fib 1', async () => {
      var fib = await fibonacii.fib(0);
      assert(fib = '1');
    });
    it('should return fib 2', async () => {
      var fib = await fibonacii.fib(0);
      assert(fib = '1');
    });
    it('should return fib 12', async () => {
      var fib = await fibonacii.fib(0);
      assert(fib = '144');
    });
  })
});