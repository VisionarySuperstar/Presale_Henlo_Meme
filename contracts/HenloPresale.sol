// SPDX-License-Identifier: MIT


pragma solidity ^0.8.19;


library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        return c;
    }
}
abstract contract Context {
    
    function _msgSender() internal view virtual returns (address payable) {
        return payable(msg.sender);
    }

    function _msgData() internal view virtual returns (bytes memory) {
        this;
        return msg.data;
    }
}

contract Ownable is Context {
    address public _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor () {
        address msgSender = _msgSender();
        _owner = msgSender;
        authorizations[_owner] = true;
        emit OwnershipTransferred(address(0), msgSender);
    }
    mapping (address => bool) internal authorizations;

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
contract HENLOPresale is Ownable {
    using SafeMath for uint256;

    IERC20 public token;
    uint256 public presaleRate;
    uint256 public presaleMinContribution;
    uint256 public presaleMaxContribution;
    bool public presaleStatus;
    uint256 public presaleEndTime;

    mapping(address => uint256) public contributions;

    event TokensPurchased(address indexed purchaser, uint256 amount);
    event PresaleStatusChanged(bool newStatus);

    constructor(
        address _tokenAddress,
        uint256 _presaleRate,
        uint256 _presaleMinContribution,
        uint256 _presaleMaxContribution,
        uint256 _presaleDuration
    )  {
        token = IERC20(_tokenAddress);
        presaleRate = _presaleRate;
        presaleMinContribution = _presaleMinContribution;
        presaleMaxContribution = _presaleMaxContribution;
        presaleEndTime = block.timestamp + _presaleDuration;
        presaleStatus = true;
    }

    function buyTokens() public payable {
        require(presaleStatus, "Presale is not active");
        require(block.timestamp < presaleEndTime, "Presale has ended");
        require(msg.value >= presaleMinContribution, "Contribution below minimum");
        require(contributions[msg.sender].add(msg.value) <= presaleMaxContribution, "Exceeds maximum contribution");

        uint256 tokenAmount = msg.value.mul(presaleRate);
        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in contract");

        contributions[msg.sender] = contributions[msg.sender].add(msg.value);
        require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");

        emit TokensPurchased(msg.sender, tokenAmount);
    }

    function setPresaleStatus(bool _status) public onlyOwner {
        presaleStatus = _status;
        emit PresaleStatusChanged(_status);
    }

    function withdrawTokens(uint256 amount) public onlyOwner {
        require(token.transfer(owner(), amount), "Token transfer failed");
    }

    function withdrawFunds() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function extendPresale(uint256 _additionalTime) public onlyOwner {
        presaleEndTime = presaleEndTime.add(_additionalTime);
    }

    receive() external payable {
        buyTokens();
    }
}