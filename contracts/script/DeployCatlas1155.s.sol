// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {Catlas1155} from "../src/Catlas1155.sol";

/// forge script script/DeployCatlas1155.s.sol:DeployCatlas1155 \
///   --rpc-url $RPC_URL --broadcast --verify --verifier blockscout \
///   --account <ACCOUNT_ALIAS_OR_ADDRESS> \
///   -vvvv
///
/// Required env vars:
/// - CHARITY: address to receive split
/// Optional:
/// - OWNER: owner address (defaults to broadcaster when omitted)
contract DeployCatlas1155 is Script {
    function run() external returns (Catlas1155 deployed) {
        address charity = vm.envAddress("CHARITY");
        address owner = 0x12d39C23E8323e19FA04bFf5108F059946Ede36e;

        // Use the broadcaster provided via CLI flags (e.g., --account, --private-key, --mnemonic)
        vm.startBroadcast();

        console2.log("Broadcaster:", tx.origin);
        console2.log("Owner:", owner);
        console2.log("Charity:", charity);

        deployed = new Catlas1155(owner, charity);
        deployed.setMintPrice(0.00001 ether);

        vm.stopBroadcast();

        console2.log("Catlas1155 deployed at:", address(deployed));
    }
}


