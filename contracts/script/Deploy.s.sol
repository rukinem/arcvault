// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/USDCStaking.sol";

/// Deploy USDCStaking to Arc testnet.
/// Usage:
///   forge script script/Deploy.s.sol:Deploy \
///     --rpc-url arc_testnet \
///     --private-key $PRIVATE_KEY \
///     --broadcast
contract Deploy is Script {
    // Native USDC system contract on Arc
    address constant USDC = 0x3600000000000000000000000000000000000000;
    // 7.84% APY
    uint256 constant APY_BPS = 784;

    function run() external {
        vm.startBroadcast();
        USDCStaking staking = new USDCStaking(USDC, APY_BPS);
        vm.stopBroadcast();

        console.log("USDCStaking deployed at:", address(staking));
        console.log("USDC:", USDC);
        console.log("APY (bps):", APY_BPS);
    }
}
