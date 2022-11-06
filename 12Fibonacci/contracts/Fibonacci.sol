// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Fibonacii {
  
  function fib(uint n) pure external returns(uint) {
    if (n == 0) {
      return 0;
    }

    uint f1 = 1;
    uint f2 = 1;

    for(uint i = 2; i < n - 2; i++) {
      uint fi = f1 + f2;
      f2 = f1;
      f1 = fi;
    }

    return f1;
  }
}