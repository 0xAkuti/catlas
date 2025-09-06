// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "solady/tokens/ERC1155.sol";
import {Ownable} from "solady/auth/Ownable.sol";
import {LibString} from "solady/utils/LibString.sol";
import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";

/// @title Catlas1155
/// @notice ERC1155 collection where each cat is a token ID with its own URI.
///         New cats are published with `publishCat`, which mints 1 to creator.
///         Anyone can `mint` existing IDs by paying the fixed price.
contract Catlas1155 is ERC1155, Ownable {
    using LibString for uint256;

    /// @dev Next token id to be assigned on `publishCat`.
    uint256 public nextTokenId;

    /// @dev Fixed mint price per token (in wei). Default 0.001 ether.
    uint256 public mintPrice = 0.001 ether;

    /// @dev Charity address for revenue split.
    address public immutable charity;

    /// @dev Mapping tokenId => metadata content identifier (IPFS CID).
    mapping(uint256 => string) internal _tokenCid;

    /// @dev Mapping tokenId => creator address.
    mapping(uint256 => address) public creatorOf;

    /// @dev Mapping tokenId => total minted supply (no burns supported in this contract).
    mapping(uint256 => uint256) internal _totalSupply;

    event CatPublished(uint256 indexed tokenId, address indexed creator, string cid);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);

    constructor(address _owner, address _charity) {
        _initializeOwner(_owner);
        require(_charity != address(0), "INVALID_CHARITY");
        charity = _charity;
    }

    /// @notice Publish a new cat collection.
    /// @param cid IPFS CID to metadata JSON.
    /// @return tokenId Newly assigned token ID.
    function publishCat(string calldata cid) external returns (uint256 tokenId) {
        require(bytes(cid).length != 0, "EMPTY_CID");
        tokenId = nextTokenId++;
        _tokenCid[tokenId] = cid;
        creatorOf[tokenId] = msg.sender;
        _mint(msg.sender, tokenId, 1, "");
        unchecked {
            _totalSupply[tokenId] += 1;
        }
        emit CatPublished(tokenId, msg.sender, cid);
    }

    /// @notice Mint existing cat token.
    function mint(uint256 tokenId, uint256 amount) external payable {
        require(amount > 0, "AMOUNT_ZERO");
        require(bytes(_tokenCid[tokenId]).length != 0, "UNKNOWN_TOKEN");
        uint256 cost = mintPrice * amount;
        require(msg.value == cost, "INCORRECT_PRICE");

        _mint(msg.sender, tokenId, amount, "");
        unchecked {
            _totalSupply[tokenId] += amount;
        }

        // Equal split between contract owner, creator, and charity (using SafeTransferLib).
        uint256 share = msg.value / 3;
        SafeTransferLib.forceSafeTransferETH(owner(), share);
        SafeTransferLib.forceSafeTransferETH(creatorOf[tokenId], share);
        SafeTransferLib.forceSafeTransferETH(charity, msg.value - share - share);
    }

    /// @notice Update the fixed mint price. Owner only.
    function setMintPrice(uint256 newPrice) external onlyOwner {
        emit MintPriceUpdated(mintPrice, newPrice);
        mintPrice = newPrice;
    }

    /// @inheritdoc ERC1155
    function uri(uint256 id) public view override returns (string memory) {
        string memory cid = _tokenCid[id];
        require(bytes(cid).length != 0, "UNKNOWN_TOKEN");
        // Standard IPFS gateway-neutral URI: ipfs://CID
        return string.concat("ipfs://", cid);
    }

    /// @notice Returns the total minted supply for a token id.
    function totalSupply(uint256 id) external view returns (uint256) {
        return _totalSupply[id];
    }
}


