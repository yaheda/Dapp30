// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

//1. send tweet
//2. sent private messages
//3. follow other people
//4. get list of tweets
//5. implement an api
contract Twitter {

  struct Tweet {
    uint id;
    address author;
    string content;
    uint createdAt;
  }

  struct Message {
    uint id;
    string content;
    address from;
    address to;
    uint createdAt;
  }

  mapping(uint => Tweet) private tweets;
  uint private nextTweetId;
  mapping(address => uint[]) private tweetsOf;

  mapping(uint => Message[]) private conversations;
  uint private nextMessageId;

  mapping(address => address[]) private following;

  event TweetSent (
    uint id,
    address indexed author,
    string content,
    uint createdAt
  );

  event MessageSent(
     uint id,
    string content,
    address indexed from,
    address indexed to,
    uint createdAt
  );

  function tweet(string calldata _content) external {
    tweets[nextTweetId] = Tweet(nextTweetId, msg.sender, _content, block.timestamp);
    tweetsOf[msg.sender].push(nextTweetId);
    emit TweetSent(nextTweetId, msg.sender, _content, block.timestamp);
    nextTweetId++;
  }

  function sendMessage(
    string calldata _content,
    address _from,
    address _to) 
    external {
    uint conversationId = uint(uint160(_from)) + uint(uint160(_to));
    conversations[conversationId].push(Message(
      nextMessageId, 
      _content, 
      _from, 
      _to, 
      block.timestamp));
      emit MessageSent(nextMessageId, _content, _from, _to, block.timestamp);
      nextMessageId++;
  }

  function follow(address _followed) external {
    following[msg.sender].push(_followed);
  }

  function getLatestTweets(uint count) view external returns(Tweet[] memory) {
    require(count > 0, 'Too few tweets');
    require(count <= nextTweetId, 'Too many tweets');
    Tweet[] memory _tweets = new Tweet[](count);
    for(uint i = nextTweetId - count; i < nextTweetId; i++) {
      Tweet storage _tweet = tweets[i];
      _tweets[i] = Tweet(_tweet.id, _tweet.author, _tweet.content, _tweet.createdAt);
    }
    return _tweets;
  }

  function getTweetsOf(address _user, uint count) view external returns(Tweet[] memory) {
    uint[] storage tweetIds = tweetsOf[_user];

    require(count > 0, 'Too few tweets');
    require(count <= tweetIds.length, 'Too many tweets');
    
    Tweet[] memory _tweets = new Tweet[](count);
    for(uint i = tweetIds.length - count; i < tweetIds.length; i++) {
      Tweet storage _tweet = tweets[tweetIds[i]];
      _tweets[i] = Tweet(_tweet.id, _tweet.author, _tweet.content, _tweet.createdAt);
    }
    return _tweets;
  }

}