// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract PMoolaToken is Context, ERC20, Ownable {
    uint256 public constant MAX_RAISE = 50_000_000_000_000_000_000;
    uint256 public constant PMOOLA_PER_BNB = 500_000;

    address public operationsWalletAddress;
    uint256 public totalRaised = 0;

    constructor(address _operationsWalletAddress) Ownable() ERC20("PMoola Token", "PMOOLA") {
        operationsWalletAddress = _operationsWalletAddress;
    }

    function claim() external payable {
        require(totalRaised < MAX_RAISE, "MAX_CLAIM_REACHED");
        require(totalRaised + msg.value < MAX_RAISE, "CLAIM_AMOUNT_TOO_LARGE");
        require(this.balanceOf(msg.sender) == 0, "ALREADY_CLAIMED");
        require(msg.value >= 1 * 10**decimals(), "INVALID_CLAIM_AMOUNT");
        require(msg.value <= 2 * 10**decimals(), "INVALID_CLAIM_AMOUNT");

        totalRaised += msg.value;
        _mint(msg.sender, PMOOLA_PER_BNB * msg.value);
    }
}
