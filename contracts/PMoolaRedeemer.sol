// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PMoolaRedeemer is Context, Ownable {
    address public pMoolaAddress;
    address public moolaAddress;
    address public operationsWalletAddress;

    bool private canRedeem;

    mapping(address => bool) private redeemed;

    constructor(
        address _moolaAddress,
        address _pMoolaAddress,
        address _operationsWalletAddress
    ) Ownable() {
        moolaAddress = _moolaAddress;
        operationsWalletAddress = _operationsWalletAddress;
        pMoolaAddress = _pMoolaAddress;
    }

    /// @notice redeem pMoola for Moola
    function redeem() external {
        require(canRedeem, "REDEEM_NOT_ENABLED");
        require(redeemed[msg.sender] == false, "ALREADY_REDEEMED");

        IERC20 pMoolaToken = IERC20(pMoolaAddress);
        uint256 pMoolaBalance = pMoolaToken.balanceOf(msg.sender);
        require(pMoolaBalance > 0, "NO_PMOOLA_TO_REDEEM");

        redeemed[msg.sender] = true;

        pMoolaToken.transferFrom(msg.sender, address(this), pMoolaBalance);

        //transfer moola * 10 to sender
        IERC20 moolaToken = IERC20(moolaAddress);
        moolaToken.transfer(msg.sender, pMoolaBalance * 10);
    }

    /// @notice return total amount of Moola available to redeem
    function getMoolaBalance() external view returns (uint256) {
        IERC20 moolaToken = IERC20(moolaAddress);
        return moolaToken.balanceOf(address(this));
    }

    /// @notice Checks if message sender has already redeemed
    function hasRedeemed() external view returns (bool) {
        return redeemed[msg.sender];
    }

    /// @notice withdraw bnb to operations wallet
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "NOTHING_TO_WITHDRAW");
        (payable(operationsWalletAddress)).transfer(balance);
    }

    /// @notice withdraw lost funds to operations wallet
    function withdrawToken(address tokenAddress) external onlyOwner {
        IERC20 tokenToWithdraw = IERC20(tokenAddress);
        uint256 balance = tokenToWithdraw.balanceOf(address(this));

        require(balance > 0, "NOTHING_TO_WITHDRAW");

        tokenToWithdraw.transfer(operationsWalletAddress, balance);
    }

    /// @notice enable/disable users ability to redeem
    function setCanRedeem(bool value) external onlyOwner {
        canRedeem = value;
    }

    /// @notice set moola address
    function setMoolaAddress(address payable wallet) external onlyOwner {
        moolaAddress = wallet;
    }

    /// @notice set operations address
    function setOperationsAddress(address payable wallet) external onlyOwner {
        operationsWalletAddress = wallet;
    }

    /// @notice set pMoola address
    function setPMoolaAddress(address payable wallet) external onlyOwner {
        pMoolaAddress = wallet;
    }
}
