const Strings = artifacts.require('Strings.sol');

contract('Strings', () => {
  let strings;

  beforeEach(async () => {
    strings = await Strings.new();
  });

  contract('length', () => {
    it('Should return the length', async () => {
      var hello = 'benzona';
      var length = await strings.length(hello);
      assert(hello.length == length); 
    });
  });

  contract('concatenate', () => {
    it('Should concatetnate', async () => {
      var word1 = 'benzona';
      var word2 = 'sharmuta';
      var result = await strings.concatenate(word1, word2);
      assert(result == word1 + word2);
    })
  });
})