//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Crowdsale {
    address owner;
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;
    uint public openDate;
    bool public paused;

    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);
    event Request(address indexed _user);
    event Whitelisted(address indexed _user, string message);
    event Revoke(address indexed _user, string message);

    mapping(address => bool) public whitelistedUsers;
    mapping(address => Proposal) public requestedWhitelist;

    struct Proposal{
        string name;
        string message;
        bool approved;
    }

    constructor(
        Token _token,
        uint256 _price,
        uint256 _maxTokens,
        uint _openDate
    ) {
        require(_openDate > block.timestamp);
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
        openDate = _openDate;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    // Buy tokens directly by sending Ether
    // --> https://docs.soliditylang.org/en/v0.8.15/contracts.html#receive-ether-function

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    function buyTokens(uint256 _amount) public payable {
        require(msg.value == (_amount / 1e18) * price);
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount));
        require(whitelistedUsers[msg.sender] == true, "Must be on whitelist");
        require(block.timestamp >= openDate, "Sale not open yet");
        require(paused == false, "Sale is paused");
        tokensSold += _amount;

        emit Buy(_amount, msg.sender);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    function setOpenDate(uint _openDate) public onlyOwner {
        openDate = _openDate;
    }

    function requestWhitelist(string memory _name, string memory _message) external {
        
        requestedWhitelist[msg.sender] = Proposal({
        name: _name,
        message: _message,
        approved: false
        });

        emit Request(msg.sender);
    }

    function addToWhitelist(address _user) public onlyOwner {
        whitelistedUsers[_user] = true;

        Proposal storage proposal = requestedWhitelist[_user];

        proposal.approved = true;


        emit Whitelisted(_user, "Request Approved");
    }

    function removeFromWhitelist(address _user) public onlyOwner {
        whitelistedUsers[_user] = false;

        Proposal storage proposal = requestedWhitelist[_user];

        proposal.approved = false;

        emit Revoke(_user, "Removed from Whitelist");
    }

    function pauseSale() public onlyOwner {
        paused = true;
    }

    function unpauseSale() public onlyOwner {
        paused = false;
    }

    // Finalize Sale
    function finalize() public onlyOwner {
        require(token.transfer(owner, token.balanceOf(address(this))));

        uint256 value = address(this).balance;
        (bool sent, ) = owner.call{value: value}("");
        require(sent);

        emit Finalize(tokensSold, value);
    }
}

