// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Catlas1155} from "../src/Catlas1155.sol";
import {Ownable} from "solady/auth/Ownable.sol";

contract Catlas1155Test is Test {
    address payable internal OWNER = payable(address(0xA11CE));
    address payable internal CHARITY = payable(address(0xC0FFEE));
    address payable internal CREATOR = payable(address(0xBEEF));
    address payable internal BUYER = payable(address(0xD00D));

    Catlas1155 internal wc;

    function setUp() public {
        wc = new Catlas1155(OWNER, CHARITY);
        // Seed buyer with ETH
        vm.deal(BUYER, 10 ether);
    }

    function test_PublishCatAndUri() public {
        vm.prank(CREATOR);
        uint256 id = wc.publishCat("bafycatcid123");
        assertEq(id, 0);
        assertEq(wc.uri(id), string.concat("ipfs://", "bafycatcid123"));
        // Next publish should increment id
        vm.prank(CREATOR);
        uint256 id2 = wc.publishCat("bafycatcid456");
        assertEq(id2, 1);
    }

    function test_DefaultMintPrice() public {
        assertEq(wc.mintPrice(), 0.00001 ether);
    }

    function test_SetMintPrice_OnlyOwner() public {
        vm.expectRevert(Ownable.Unauthorized.selector);
        wc.setMintPrice(2e15);

        vm.prank(OWNER);
        wc.setMintPrice(2e15);
        assertEq(wc.mintPrice(), 0.002 ether);
    }

    function test_Mint_RevertUnknownToken() public {
        vm.expectRevert(Catlas1155.TokenDoesNotExist.selector);
        wc.mint(999, 1);
    }

    function test_Mint_RevertAmountZero() public {
        vm.prank(CREATOR);
        uint256 id = wc.publishCat("cid");
        vm.expectRevert(Catlas1155.InvalidAmount.selector);
        wc.mint(id, 0);
    }

    function test_Mint_RevertIncorrectPrice() public {
        vm.prank(CREATOR);
        uint256 id = wc.publishCat("cid");
        vm.prank(BUYER);
        vm.expectRevert(Catlas1155.InvalidPrice.selector);
        wc.mint{value: 0}(id, 1);
    }

    function test_Mint_SplitsAndBalances() public {
        vm.prank(CREATOR);
        uint256 id = wc.publishCat("cid");

        uint256 price = wc.mintPrice(); // 0.001 ether
        uint256 ownerBefore = OWNER.balance;
        uint256 creatorBefore = CREATOR.balance;
        uint256 charityBefore = CHARITY.balance;

        vm.prank(BUYER);
        wc.mint{value: price}(id, 1);

        // Buyer received 1 token
        assertEq(wc.balanceOf(BUYER, id), 1);
        // Total supply updated
        assertEq(wc.totalSupply(id), 2); // 1 to creator on publish + 1 to buyer

        // Splits: equal thirds; charity receives remainder if any
        uint256 share = price / 3;
        assertEq(OWNER.balance, ownerBefore + share);
        assertEq(CREATOR.balance, creatorBefore + share);
        assertEq(CHARITY.balance, charityBefore + (price - share - share));
    }
}


