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
    uint256 public allowMintingOn;


    mapping(address => bool) public whitelist;
    mapping(address => bool) public pendingRequests;

    event WhitelistRequested(address indexed user, string message);
    event WhitelistApproved(address indexed user);
    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);

    constructor(Token _token, uint256 _price, uint256 _maxTokens, uint256 _allowMintingOn) {
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
        allowMintingOn = _allowMintingOn;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Must be the owner!");
        _;
    }

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "Not on whitelist");
        _;
    }

    // Buy tokens directly by sending Ether
    // --> https://docs.soliditylang.org/en/v0.8.15/contracts.html#receive-ether-function

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    function requestWhitelist(string memory _message) external {
        require(!pendingRequests[msg.sender], "Already requested");
        pendingRequests[msg.sender] = true;
        
        emit WhitelistRequested(msg.sender, _message);
    }
    
    function addToWhitelist(address _user) external onlyOwner {
        require(whitelist[_user] == false, "already in whitelist");
        require(pendingRequests[_user] == true, "No request found");
        whitelist[_user] = true; 

        emit WhitelistApproved(_user);
    }

    function removeFromWhitelist(address _user) external onlyOwner {
        whitelist[_user] = false;
    }

    function buyTokens(uint256 _amount) public payable onlyWhitelisted{
        require(block.timestamp >= allowMintingOn);
        require(msg.value == (_amount / 1e18) * price);
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount));

        tokensSold += _amount;

        emit Buy(_amount, msg.sender);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
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
