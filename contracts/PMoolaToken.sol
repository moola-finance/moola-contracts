// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PMoolaToken is Context, ERC20, Ownable {
    uint256 public constant MAX_RAISE = 50 ether;
    uint256 public constant PMOOLA_PER_BNB = 600_000;

    address public operationsWalletAddress;
    address public moolaAddress;

    uint256 private totalRaised = 0;

    mapping(address => bool) private claimed;
    bool private canRedeem;

    constructor(address _operationsWalletAddress, address _moolaAddress) Ownable() ERC20("PMoola Token", "PMOOLA") {
        operationsWalletAddress = _operationsWalletAddress;
        moolaAddress = _moolaAddress;
    }

    /// @notice Exchange supplied amount of bnb for pMoola
    function claim() external payable {
        require(totalRaised < MAX_RAISE, "MAX_CLAIM_REACHED");
        require(totalRaised + msg.value < MAX_RAISE, "CLAIM_AMOUNT_TOO_LARGE");
        require(claimed[msg.sender] == false, "ALREADY_CLAIMED");
        require(msg.value >= 1 ether && msg.value <= 2 ether, "INVALID_CLAIM_AMOUNT");

        totalRaised += msg.value;
        claimed[msg.sender] = true;
        _mint(msg.sender, PMOOLA_PER_BNB * msg.value);
    }

    /// @notice redeem pMoola for Moola
    function redeem() external {
        require(canRedeem, "REDEEM_NOT_ENABLED");

        uint256 pMoolaBalance = this.balanceOf(msg.sender);
        require(pMoolaBalance > 0, "NO_PMOOLA_TO_REDEEM");

        _burn(msg.sender, this.balanceOf(msg.sender));

        IERC20 moolaToken = IERC20(moolaAddress);
        moolaToken.transfer(msg.sender, pMoolaBalance);
    }

    /// @notice return total amount of Moola raised locked and available to redeem
    function getMoolaBalance() external view returns (uint256) {
        IERC20 moolaToken = IERC20(moolaAddress);
        return moolaToken.balanceOf(address(this));
    }

    /// @notice Checks if message sender has already claimed
    function hasClaimed() external view returns (bool) {
        return claimed[msg.sender];
    }

    /// @notice withdraw funds to operations wallet
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "NOTHING_TO_WITHDRAW");
        (payable(operationsWalletAddress)).transfer(balance);
    }

    /// @notice enable/disable users ability to redeem
    function setCanRedeem(bool value) external onlyOwner {
        canRedeem = value;
    }

    function getTotalRaised() external view returns (uint256) {
        return totalRaised;
    }
}
