const Twitter = artifacts.require('Twitter.sol');

const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract('ERC721Token', ([deployer, user1, user2, user3, user4]) => {
  let twitter;

  beforeEach(async () => {
    twitter = await Twitter.new();
  })

  context('Send Tweet', () => {
    it('Should send tweet', async () => {
      const tx = await twitter.sendTweet('hello world', { from: user1 });
      await expectEvent(tx, 'TweetSent',{
        id: web3.utils.toBN(0),
        author: user1,
        content: 'hello world'
      })
    })
    it('Should return latest tweets', async () => {
      await twitter.sendTweet('hello world', { from: user1 });
      await twitter.sendTweet('benzona', { from: user1 });
      await twitter.sendTweet('running gold', { from: user1 });
      let tweets = await twitter.getLatestTweets(1);
      assert.equal(tweets.length, 1);
      assert.equal(tweets[0].author, user1);
      assert.equal(tweets[0].content, 'running gold');
    })
    it('Should return tweets of', async () => {
      await twitter.sendTweet('hello world', { from: user1 });
      await twitter.sendTweet('benzona', { from: user1 });
      await twitter.sendTweet('running gold', { from: user1 });
      let tweets = await twitter.getTweetsOf(user1, 1);
      assert.equal(tweets.length, 1);
      assert.equal(tweets[0].author, user1);
      assert.equal(tweets[0].content, 'running gold');
    })
  })

  context('Send Tweet From', () => {
    it('Should send tweet from', async () => {
      await twitter.approve(user2, { from: user1});
      await twitter.sendTweetFrom(user1, 'hello world', { from: user2 });
    })
    it('Should not send tweet from if not approved', async () => {
      await expectRevert(
        twitter.sendTweetFrom(user1, 'hello world', { from: user2 }),
        'Operator not authorised'
      )
    })
    it('Should not send tweet from if disapproved', async () => {
      await twitter.approve(user2, { from: user1});
      await twitter.sendTweetFrom(user1, 'hello world', { from: user2 });
      await twitter.disapprove(user2, { from: user1});
      await expectRevert(
        twitter.sendTweetFrom(user1, 'hello world', { from: user2 }),
        'Operator not authorised'
      )
    })
  })

  context('Send Message', () => {
    it('Should send message', async () => {
      const tx = await twitter.sendMessage('sharmuta', user2, { from: user1});
      await expectEvent(tx, 'MessageSent',{
        id: web3.utils.toBN(0),
        content: 'sharmuta',
        from: user1,
        to: user2
      })
    })
    it.only('Should return conversation', async () => {
      await twitter.sendMessage('sharmuta', user2, { from: user1});
      await twitter.sendMessage('benzona', user2, { from: user1});
      await twitter.sendMessage('zabi', user2, { from: user1});
      let messages = await twitter.getConversation(user1, user2, 1);
      assert.equal(messages.length, 1);
      assert.equal(messages[0].content, 'zabi');
      assert.equal(messages[0].from, user1);
      assert.equal(messages[0].to, user2);
    })
  })



  context('Follow', () => {
    it('Should follow', async () => {
      const tx = await twitter.follow(user2, { from: user1 })
      await expectEvent(tx, 'Follow',{
        from: user1,
        followed: user2
      })
    })
    it('Should return followings', async () => {
      await twitter.follow(user2, { from: user1 });
      await twitter.follow(user3, { from: user1 });
      await twitter.follow(user4, { from: user1 });
      let followings = await twitter.getFollowings(user1, 1);
      assert.equal(followings.length, 1);
      assert.equal(followings[0].user, user4);
    })
  })

  context('Follow from', () => {
    it('Should follow from', async () => {
      await twitter.approve(user2, { from: user1});
      await twitter.followFrom(user1, user2, { from: user2 });
    })
    it('Should not follow from id not approved', async () => {
      await expectRevert(
        twitter.followFrom(user1, user2, { from: user2 }),
        'Operator not authorised'
      )
    })
  })

});