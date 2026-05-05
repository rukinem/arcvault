// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockEURC — testnet-only mintable ERC20 mimicking Circle's EURC.
/// @notice Anyone can mint up to `MAX_FAUCET` per call from the faucet to
///         simulate getting EURC on Arc testnet. Decimals fixed to 6, just
///         like the real EURC.
contract MockEURC {
    string public constant name = "Mock Euro Coin";
    string public constant symbol = "EURC";
    uint8 public constant decimals = 6;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    /// 1,000 EURC max per faucet call.
    uint256 public constant MAX_FAUCET = 1_000 * 10 ** 6;

    address public immutable owner;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        owner = msg.sender;
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 a = allowance[from][msg.sender];
        require(a >= value, "EURC: allowance");
        if (a != type(uint256).max) {
            allowance[from][msg.sender] = a - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "EURC: zero to");
        uint256 b = balanceOf[from];
        require(b >= value, "EURC: balance");
        unchecked {
            balanceOf[from] = b - value;
            balanceOf[to] += value;
        }
        emit Transfer(from, to, value);
    }

    /// Public faucet — anyone can mint up to MAX_FAUCET tokens for themselves.
    function faucet(uint256 amount) external {
        require(amount > 0 && amount <= MAX_FAUCET, "EURC: faucet limit");
        _mint(msg.sender, amount);
    }

    /// Owner-only mint, useful for seeding the AMM pool from the deployer.
    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "EURC: not owner");
        _mint(to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        unchecked {
            balanceOf[to] += amount;
        }
        emit Transfer(address(0), to, amount);
    }
}
