// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

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

  mapping(uint => Message[]) private conversations;
  uint private nextMessageId;

  function tweet(string calldata _content) external {
    tweets[nextTweetId] = Tweet(nextTweetId, msg.sender, _content, block.timestamp);
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
      nextMessageId++;
  }
}