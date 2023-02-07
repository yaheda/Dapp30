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

  mapping(address => mapping(address => bool)) private operators;

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

  function approve(address operator) external {
    operators[msg.sender][operator] = true;
  }

  function disapprove(address operator) external {
    operators[msg.sender][operator] = false;
  }

  function sendTweet(string calldata _content) external {
    _sendTweet(msg.sender, _content);
  }

  function sendTweetFrom(address _from, string calldata _content) external canOperate(_from) {
    _sendTweet(_from, _content);
  }

  function sendMessage(
    string calldata _content,
    address _from,
    address _to) 
    external {
    _sendMessage(_content, _from, _to);
  }

  function sendMessageFrom(
    string calldata _content,
    address _from,
    address _to) 
    external canOperate(_from) {
    _sendMessage(_content, _from, _to);
  }

  function follow(address _followed) external {
    _follow(msg.sender, _followed);
  }

  function followFrom(address _from, address _followed) external canOperate(_from) {
    _follow(_from, _followed);
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

  
  function _sendTweet(address _from, string memory _content) internal {
    tweets[nextTweetId] = Tweet(nextTweetId, _from, _content, block.timestamp);
    tweetsOf[_from].push(nextTweetId);
    emit TweetSent(nextTweetId, msg.sender, _content, block.timestamp);
    nextTweetId++;
  }

  function _sendMessage(
    string calldata _content,
    address _from,
    address _to) 
    internal {
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

  function _follow(address _from, address _followed) internal {
    following[_from].push(_followed);
  }

  modifier canOperate(address _from) {
    require(operators[_from][msg.sender] == true, 'Operator not authorised');
    _;
  }

}