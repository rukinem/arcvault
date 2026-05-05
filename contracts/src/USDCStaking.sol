// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
}

/// @title USDCStaking — simple linear-APY staking on Arc testnet
/// @notice Users deposit native USDC (Arc system token) and accrue rewards
///         continuously at a fixed APY. Owner funds the reward pool via
///         direct USDC transfers to this contract.
contract USDCStaking {
    IERC20 public immutable usdc;
    address public owner;

    /// APY in basis points (e.g. 784 = 7.84%)
    uint256 public apyBps;
    uint256 public constant YEAR = 365 days;

    struct Position {
        uint128 principal;
        uint128 rewardDebt;
        uint64 lastUpdate;
    }

    mapping(address => Position) public positions;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event Claimed(address indexed user, uint256 rewards);
    event ApyUpdated(uint256 newApyBps);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address _usdc, uint256 _apyBps) {
        usdc = IERC20(_usdc);
        apyBps = _apyBps;
        owner = msg.sender;
    }

    function setApy(uint256 _apyBps) external onlyOwner {
        require(_apyBps <= 10_000, "apy too high");
        apyBps = _apyBps;
        emit ApyUpdated(_apyBps);
    }

    function _pending(Position memory p) internal view returns (uint256) {
        if (p.principal == 0) return p.rewardDebt;
        uint256 elapsed = block.timestamp - p.lastUpdate;
        uint256 extra = (uint256(p.principal) * apyBps * elapsed) / (10_000 * YEAR);
        return uint256(p.rewardDebt) + extra;
    }

    function pendingRewards(address user) external view returns (uint256) {
        return _pending(positions[user]);
    }

    function _accrue(address user) internal {
        Position storage p = positions[user];
        uint256 total = _pending(p);
        p.rewardDebt = uint128(total);
        p.lastUpdate = uint64(block.timestamp);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "zero amount");
        _accrue(msg.sender);
        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "transferFrom failed"
        );
        positions[msg.sender].principal += uint128(amount);
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        Position storage p = positions[msg.sender];
        require(amount > 0 && amount <= p.principal, "invalid amount");
        _accrue(msg.sender);
        p.principal -= uint128(amount);
        totalStaked -= amount;
        uint256 rewards = p.rewardDebt;
        p.rewardDebt = 0;
        uint256 payout = amount + rewards;
        require(usdc.transfer(msg.sender, payout), "transfer failed");
        emit Unstaked(msg.sender, amount, rewards);
    }

    function claim() external {
        _accrue(msg.sender);
        Position storage p = positions[msg.sender];
        uint256 rewards = p.rewardDebt;
        require(rewards > 0, "nothing to claim");
        p.rewardDebt = 0;
        require(usdc.transfer(msg.sender, rewards), "transfer failed");
        emit Claimed(msg.sender, rewards);
    }

    /// Owner can withdraw leftover reward funding (not user principal).
    function recoverExcess(uint256 amount) external onlyOwner {
        uint256 bal = usdc.balanceOf(address(this));
        require(bal >= totalStaked + amount, "would touch principal");
        require(usdc.transfer(owner, amount), "transfer failed");
    }
}
