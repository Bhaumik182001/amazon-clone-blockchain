pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AmazonCoin is ERC20, Ownable {
    constructor() ERC20("AmazonCoin", "AC") {}

    function mint(uint256 amount) public payable {
        require(msg.value == amount * 0.0001 ether, "invalid amount of ether");
        _mint(msg.sender, amount);
    }

    receive() external payable{}
    fallback() external payable{}
}