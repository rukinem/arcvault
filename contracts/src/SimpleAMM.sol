// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
}

/// @title SimpleAMM — Uniswap V2 style constant-product pair (USDC / EURC).
/// @notice 0.3% swap fee retained by liquidity providers. Reserves use
///         uint112 to fit two reserves + a timestamp into one slot, exactly
///         like the canonical UniswapV2Pair. No ERC20 LP token interface to
///         keep the surface tiny — LP shares live in `balanceOf`.
contract SimpleAMM {
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    uint256 public constant FEE_NUM = 997; // 0.3% fee → keep 99.7%
    uint256 public constant FEE_DEN = 1000;
    uint256 public constant MINIMUM_LIQUIDITY = 1_000;

    uint112 private reserve0;
    uint112 private reserve1;
    uint32 private blockTimestampLast;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    event Mint(address indexed sender, uint256 amount0, uint256 amount1, uint256 shares);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, uint256 shares, address to);
    event Swap(
        address indexed sender,
        address indexed tokenIn,
        uint256 amountIn,
        uint256 amountOut,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    constructor(address _token0, address _token1) {
        require(_token0 != _token1 && _token0 != address(0) && _token1 != address(0), "AMM: tokens");
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    function getReserves()
        public
        view
        returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)
    {
        return (reserve0, reserve1, blockTimestampLast);
    }

    function _update(uint256 bal0, uint256 bal1) private {
        require(bal0 <= type(uint112).max && bal1 <= type(uint112).max, "AMM: overflow");
        reserve0 = uint112(bal0);
        reserve1 = uint112(bal1);
        blockTimestampLast = uint32(block.timestamp);
        emit Sync(reserve0, reserve1);
    }

    /// Add liquidity. Caller must `approve` both tokens first.
    /// First deposit sets the price ratio; subsequent deposits must roughly
    /// match it (excess is just left as reserves, no refund here for brevity —
    /// callers should compute amounts from `getReserves()` off-chain).
    function addLiquidity(uint256 amount0, uint256 amount1)
        external
        returns (uint256 shares)
    {
        require(amount0 > 0 && amount1 > 0, "AMM: zero amount");
        require(token0.transferFrom(msg.sender, address(this), amount0), "AMM: t0 in");
        require(token1.transferFrom(msg.sender, address(this), amount1), "AMM: t1 in");

        uint256 bal0 = token0.balanceOf(address(this));
        uint256 bal1 = token1.balanceOf(address(this));

        uint256 _totalSupply = totalSupply;
        if (_totalSupply == 0) {
            shares = _sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            balanceOf[address(0)] += MINIMUM_LIQUIDITY; // permanently lock
            totalSupply = MINIMUM_LIQUIDITY;
        } else {
            uint256 s0 = (amount0 * _totalSupply) / reserve0;
            uint256 s1 = (amount1 * _totalSupply) / reserve1;
            shares = s0 < s1 ? s0 : s1;
        }
        require(shares > 0, "AMM: no shares");
        balanceOf[msg.sender] += shares;
        totalSupply += shares;

        _update(bal0, bal1);
        emit Mint(msg.sender, amount0, amount1, shares);
    }

    /// Burn LP shares, return proportional reserves.
    function removeLiquidity(uint256 shares)
        external
        returns (uint256 amount0, uint256 amount1)
    {
        require(shares > 0 && balanceOf[msg.sender] >= shares, "AMM: shares");
        uint256 bal0 = token0.balanceOf(address(this));
        uint256 bal1 = token1.balanceOf(address(this));
        uint256 _totalSupply = totalSupply;

        amount0 = (shares * bal0) / _totalSupply;
        amount1 = (shares * bal1) / _totalSupply;
        require(amount0 > 0 && amount1 > 0, "AMM: zero out");

        balanceOf[msg.sender] -= shares;
        totalSupply -= shares;

        require(token0.transfer(msg.sender, amount0), "AMM: t0 out");
        require(token1.transfer(msg.sender, amount1), "AMM: t1 out");

        _update(token0.balanceOf(address(this)), token1.balanceOf(address(this)));
        emit Burn(msg.sender, amount0, amount1, shares, msg.sender);
    }

    /// Swap exact `amountIn` of `tokenIn` for `tokenOut`. Reverts if output
    /// would be below `minAmountOut` (slippage protection).
    function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut)
        external
        returns (uint256 amountOut)
    {
        require(amountIn > 0, "AMM: zero in");
        require(tokenIn == address(token0) || tokenIn == address(token1), "AMM: bad token");

        bool zeroForOne = tokenIn == address(token0);
        (uint112 rIn, uint112 rOut) = zeroForOne ? (reserve0, reserve1) : (reserve1, reserve0);

        amountOut = getAmountOut(amountIn, rIn, rOut);
        require(amountOut >= minAmountOut, "AMM: slippage");

        IERC20 tIn = zeroForOne ? token0 : token1;
        IERC20 tOut = zeroForOne ? token1 : token0;
        require(tIn.transferFrom(msg.sender, address(this), amountIn), "AMM: in xfer");
        require(tOut.transfer(msg.sender, amountOut), "AMM: out xfer");

        _update(token0.balanceOf(address(this)), token1.balanceOf(address(this)));
        emit Swap(msg.sender, tokenIn, amountIn, amountOut, msg.sender);
    }

    /// Pure helper using x*y=k with 0.3% fee on input.
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        public
        pure
        returns (uint256)
    {
        require(amountIn > 0 && reserveIn > 0 && reserveOut > 0, "AMM: liquidity");
        uint256 amountInWithFee = amountIn * FEE_NUM;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * FEE_DEN + amountInWithFee;
        return numerator / denominator;
    }

    function _sqrt(uint256 y) private pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
