// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 

contract PMoolaExchange is Context, Ownable {
    address public pMoolaAddress;
    bool private canExchange;
    uint256 public constant PMOOLA_PER_BNB = 600_000;

    mapping(address => bool) private exchanged;

    event Exchange(address indexed sender, uint indexed from, uint indexed to);

    constructor(address _pMoolaAddress) Ownable() {
        pMoolaAddress = _pMoolaAddress;
    }

    /// @notice exchange pMoola for BNB
    function exchange() external {
        require(canExchange, "EXCHANGE_NOT_ENABLED");
        require(exchanged[msg.sender] == false, "ALREADY_EXCHANGED");

        IERC20 pMoolaToken = IERC20(pMoolaAddress);
        uint256 pMoolaBalance = pMoolaToken.balanceOf(msg.sender);
        require(pMoolaBalance > 0, "NO_PMOOLA_TO_EXCHANGE");

        uint256 bnbToTransfer = pMoolaBalance / PMOOLA_PER_BNB; 

        exchanged[msg.sender] = true;

        pMoolaToken.transferFrom(msg.sender, address(this), pMoolaBalance);
        (payable(msg.sender)).transfer(bnbToTransfer);

        emit Exchange(msg.sender, pMoolaBalance, bnbToTransfer);
    }

    /// @notice Checks if message sender has already exchanged pMoola for BNB
    function hasExchanged() external view returns (bool) {
        return exchanged[msg.sender];
    }

    /// @notice withdraw bnb to operations wallet
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "NOTHING_TO_WITHDRAW");
        (payable(msg.sender)).transfer(balance);
    }

    /// @notice withdraw lost funds to operations wallet
    function withdrawToken(address tokenAddress) external onlyOwner {
        IERC20 tokenToWithdraw = IERC20(tokenAddress);
        uint256 balance = tokenToWithdraw.balanceOf(address(this));

        require(balance > 0, "NOTHING_TO_WITHDRAW");

        tokenToWithdraw.transfer(msg.sender, balance);
    }

    /// @notice enable/disable users ability to redeem
    function setCanExchange(bool value) external onlyOwner {
        canExchange = value;
    } 

    /// @notice set pMoola address
    function setPMoolaAddress(address payable wallet) external onlyOwner {
        pMoolaAddress = wallet;
    }

    receive() external payable {}
}
