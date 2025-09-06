// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {WorldCat1155} from "../src/WorldCat1155.sol";

/// forge script script/DeployWorldCat1155.s.sol:DeployWorldCat1155 \
///   --rpc-url $RPC_URL --broadcast --verify --verifier blockscout \
///   --private-key $PRIVATE_KEY \
///   -vvvv
///
/// Required env vars:
/// - PRIVATE_KEY: hex private key for deployer (used for broadcasting)
/// - CHARITY: address to receive split
/// Optional:
/// - OWNER: owner address (defaults to deployer)
contract DeployWorldCat1155 is Script {
    function run() external returns (WorldCat1155 deployed) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address charity = vm.envAddress("CHARITY");
        address owner = vm.envOr("OWNER", address(0));

        address deployer = vm.addr(deployerKey);
        if (owner == address(0)) owner = deployer;

        console2.log("Deployer:", deployer);
        console2.log("Owner:", owner);
        console2.log("Charity:", charity);

        vm.startBroadcast(deployerKey);
        deployed = new WorldCat1155(owner, charity);
        vm.stopBroadcast();

        console2.log("WorldCat1155 deployed at:", address(deployed));
    }
}


