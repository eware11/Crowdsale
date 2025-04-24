// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
import "./ReentrancyGuard.sol";

contract Crowdsale is ReentrancyGuard {
    address public owner;
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;
    uint256 public allowMintingOn;
    bool public isSaleClosed;
    uint256 public maxPerWallet;
    
    mapping(address => uint256) public tokensPurchased;
    mapping(address => bool) public whitelist;
    mapping(address => bool) public pendingRequests;
    
    // Proposal struct to store additional user details
    struct Proposal {
        string name;
        string email;
        string website;
        string proposalMessage;
        bool accepted;
    }
    
    mapping(address => Proposal) public proposals;

    event WhitelistRequested(address indexed user, string message);
    event WhitelistApproved(address indexed user);
    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);
    event WhitelistRejected(address indexed user); // optional for tracking

    constructor(Token _token, uint256 _price, uint256 _maxTokens, uint256 _allowMintingOn, bool _isSaleClosed) {
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
        allowMintingOn = _allowMintingOn;
        isSaleClosed = _isSaleClosed;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Must be the owner!");
        _;
    }

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "Not on whitelist");
        _;
    }

    modifier saleOpen() {
        require(!isSaleClosed, "Sale is closed");
        _;
    }

    function closeSale() external onlyOwner {
        isSaleClosed = true;
    }

    // Buy tokens directly by sending Ether
    receive() external payable onlyWhitelisted {
        uint256 amount = (msg.value * 1e18) / price;
        buyTokens(amount);
    }

    // Request whitelist with proposal
    function requestWhitelist(string memory _message, string memory _name, string memory _email, string memory _website) external {
        require(!pendingRequests[msg.sender], "Already requested");
        pendingRequests[msg.sender] = true;
        
        // Save the proposal details
        proposals[msg.sender] = Proposal(_name, _email, _website, _message, false);

        emit WhitelistRequested(msg.sender, _message);
    }

    // View a specific user's proposal
    function viewProposal(address _user) external view returns (Proposal memory) {
        return proposals[_user];
    }

    // Add a user to the whitelist
    function addToWhitelist(address _user) external onlyOwner {
        require(whitelist[_user] == false, "Already in whitelist");
        require(pendingRequests[_user] == true, "No request found");

        whitelist[_user] = true;
        emit WhitelistApproved(_user);
    }

    // Remove a user from the whitelist
    function removeFromWhitelist(address _user) external onlyOwner {
        whitelist[_user] = false;
    }

    // Reject a user from the whitelist
    function rejectWhitelist(address _user) external onlyOwner {
        require(pendingRequests[_user], "No pending request");
        pendingRequests[_user] = false;
        emit WhitelistRejected(_user);
    }

    // Set the max tokens that can be bought by a wallet
    function setMaxPerWallet(uint256 _max) external onlyOwner {
        maxPerWallet = _max;
    }

    // Function for buying tokens
    function buyTokens(uint256 amount) public payable onlyWhitelisted saleOpen nonReentrant {
        require(block.timestamp >= allowMintingOn, "Minting not allowed yet");

        uint256 expectedValue = (amount * price) / 1e18;
        require(msg.value == expectedValue, "Incorrect ETH sent");

        require(token.balanceOf(address(this)) >= amount, "Not enough tokens");
        require(tokensSold + amount <= maxTokens, "Exceeds max token cap");

        tokensPurchased[msg.sender] += amount;
        require(tokensPurchased[msg.sender] <= maxPerWallet, "Per-wallet cap exceeded");

        require(token.transfer(msg.sender, amount), "Token transfer failed");

        tokensSold += amount;

        emit Buy(amount, msg.sender);
    }

    // Set token price
    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    // Finalize the sale and transfer tokens to owner
    function finalize() public onlyOwner {
        require(token.transfer(owner, token.balanceOf(address(this))));

        uint256 value = address(this).balance;
        (bool sent, ) = owner.call{value: value}("");
        require(sent);

        emit Finalize(tokensSold, value);
    }

    // Check if a user is whitelisted
    function isWhitelisted(address _user) external view returns (bool) {
        return whitelist[_user];
    }

    // Check if a user has a pending whitelist request
    function hasPendingRequest(address _user) external view returns (bool) {
        return pendingRequests[_user];
    }
}
