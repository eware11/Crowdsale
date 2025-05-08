// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
import "./ReentrancyGuard.sol";

contract Crowdsale is ReentrancyGuard {
    Token public token;
    address public owner;
    uint256 public price;
    uint256 public maxTokensSold;
    uint256 public maxTokensPerWallet;
    uint256 public tokensSold;
    uint256 public saleOpen;
    uint256 public saleClosed;
    bool public openStatus;
    uint256 public applicationFee;

    
    mapping(address => uint256) public userTokensPurchased;
    mapping(address => bool) public whitelistedUsers;
    mapping(address => bool) public doesUserHavePendingWhitelistRequest;
    mapping(address => Proposal) public proposals;
    mapping(address => bool) public userPaidFee;

    
    // Proposal struct to store additional user details
    struct Proposal {
        address userAddress;
        string name;
        string email;
        string website;
        string message;
        bool accepted;
    }

    
    event WhitelistRequested(address indexed user, string userEmailAddress);
    event WhitelistApproved(address indexed user);
    event WhitelistRejected(address indexed user); // optional for tracking
    event TokensBought(uint256 amount, address indexed buyer);
    event FinalizeSale(uint256 tokensSold, uint256 ethRaised);

    modifier onlyOwner() {
        require(msg.sender == owner, "Must be the owner!");
        _;
    }

    modifier onlyWhitelisted() {
        require(whitelistedUsers[msg.sender] == true, "Not on whitelist");
        _;
    }

    modifier onlyWhenOpen(bool _openStatus) {
        openStatus = _openStatus;
        require(_openStatus == true, "Sale is closed");
        _;
    }

    constructor(
        Token _token, uint256 _price, 
        uint256 _maxTokensSold, uint _maxTokensPerWallet, 
        uint _saleOpen, uint _saleClosed,
        uint _tokensSold, uint _applicationFee, bool _status
        ) {
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokensSold = _maxTokensSold;
        maxTokensPerWallet = _maxTokensPerWallet;
        tokensSold = _tokensSold;
        saleOpen = _saleOpen;
        saleClosed = _saleClosed;
        openStatus = _status;
        applicationFee = _applicationFee;
    }

    function changeApplicationFee(uint _applicationFee) external onlyOwner {
        applicationFee = _applicationFee;
    }

    function submitWhitelistApplication(address _user, string memory _message, string memory _name, 
                                    string memory _email, string memory _website) 
        public payable {    
                                require(msg.value == applicationFee);
                                require(userPaidFee[msg.sender] = true);
                                Proposal({userAddress: msg.sender, message: _message, 
                                            name: _name, email: _email, website: _website,
                                            accepted: false});
                                emit WhitelistRequested(_user, _email);
    }

    function viewWhitelistApplication(address _user) external view onlyOwner returns (Proposal memory) {
        return proposals[_user];
    }

    function approveWhitelistRequest(address _user) external onlyOwner {
        require(whitelistedUsers[_user] == false);
        require(doesUserHavePendingWhitelistRequest[_user] == true);
        whitelistedUsers[_user] == true;
        doesUserHavePendingWhitelistRequest[_user] = false;
        emit WhitelistApproved(_user);
    }

    function rejectWhitelistRequest(address _user) external onlyOwner {
        require(doesUserHavePendingWhitelistRequest[_user] == true, "No pending request");
        whitelistedUsers[_user] = false;
        doesUserHavePendingWhitelistRequest[_user] = false;
        emit WhitelistRejected(_user);
    }

    function removeUserFromWhitelist(address _user) external onlyOwner {
        whitelistedUsers[_user] = false;
    }

    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
    }

    function buyTokens(uint256 _amount) public payable onlyWhitelisted onlyWhenOpen(true) nonReentrant {
        require(block.timestamp >= saleOpen, "Minting not allowed yet");
        require(userTokensPurchased[msg.sender] <= maxTokensPerWallet);
        uint256 expectedValue = (_amount * price) / 1e18;
        require(msg.value == expectedValue, "Incorrect ETH sent");

        require(token.balanceOf(address(this)) >= _amount, "Not enough tokens");

        userTokensPurchased[msg.sender] += _amount;

        require(token.transfer(msg.sender, _amount), "Token transfer failed");

        tokensSold += _amount;

        emit TokensBought(_amount, msg.sender);
    }

    function pauseCrowdsale() external onlyOwner {
        openStatus = false;
    }

    function unpauseCrowdsale() external onlyOwner {
        openStatus = true;
    }

    // Finalize the sale and transfer ether to smart contract
    function finalizeSale() external onlyOwner {
        require(token.transfer(owner, token.balanceOf(address(this))));

        uint256 value = address(this).balance;
        (bool sent, ) = owner.call{value: value}("");
        require(sent);

        emit FinalizeSale(tokensSold, value);
    }

}
