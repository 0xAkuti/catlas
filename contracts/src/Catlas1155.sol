// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "solady/tokens/ERC1155.sol";
import {Ownable} from "solady/auth/Ownable.sol";
import {LibString} from "solady/utils/LibString.sol";
import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";

/// @title Catlas1155
/// @author akuti (Catlas for EthIstanbul)
/// @notice Catlas is a collection of 1155 tokens that represent cats 
/// found around the world.
contract Catlas1155 is ERC1155, Ownable {
    using LibString for uint256;

    /// @dev Next token id to be assigned on `publishCat`.
    uint256 public nextTokenId;

    /// @dev Fixed mint price per token (in wei). Default 0.00001 ether.
    uint256 public mintPrice = 0.00001 ether;

    /// @dev Charity address for revenue split.
    address public immutable charity;

    /// @dev Mapping tokenId => metadata content identifier (IPFS CID).
    mapping(uint256 tokenId => string cid) internal _tokenCid;

    /// @dev Mapping tokenId => creator address.
    mapping(uint256 tokenId => address creator) public creatorOf;

    /// @dev Mapping tokenId => total minted supply (no burns supported in this contract).
    mapping(uint256 tokenId => uint256 supply) internal _totalSupply;

    /// @dev Total likes per token id.
    mapping(uint256 tokenId => uint256 likes) internal _likes;
    /// @dev Whether a user has liked a token id.
    mapping(uint256 tokenId => mapping(address user => bool liked)) internal _hasLiked;

    event CatPublished(uint256 indexed tokenId, address indexed creator, string cid);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event Liked(address indexed user, uint256 indexed tokenId);
    event Unliked(address indexed user, uint256 indexed tokenId);

    error EmptyCid();
    error TokenDoesNotExist();
    error InvalidPrice();
    error InvalidAmount();
    error InvalidCharity();
    error AlreadyLiked();
    error NotLiked();

    constructor(address _owner, address _charity) {
        _initializeOwner(_owner);
        if (_charity == address(0)) revert InvalidCharity();
        charity = _charity;
    }

    /// @dev Returns the name of the collection.
    function name() public pure returns (string memory) {
        return "Catlas";
    }

    /// @dev Returns the symbol of the collection.
    function symbol() public pure returns (string memory) {
        return "CATLAS";
    }

    /// @notice Publish a new cat collection.
    /// @param cid IPFS CID to metadata JSON.
    /// @return tokenId Newly assigned token ID.
    function publishCat(string calldata cid) external returns (uint256 tokenId) {
        if (bytes(cid).length == 0) revert EmptyCid();
        tokenId = nextTokenId++;
        _tokenCid[tokenId] = cid;
        creatorOf[tokenId] = msg.sender;
        _mint(msg.sender, tokenId, 1, "");
        unchecked {
            _totalSupply[tokenId] += 1;
        }
        emit CatPublished(tokenId, msg.sender, cid);
    }

    /// @notice Mint existing catlas tokens.
    function mint(uint256 tokenId, uint256 amount) external payable {
        if (amount == 0) revert InvalidAmount();
        if (bytes(_tokenCid[tokenId]).length == 0) revert TokenDoesNotExist();
        uint256 cost = mintPrice * amount;
        if (msg.value != cost) revert InvalidPrice();

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
        if (bytes(cid).length == 0) revert TokenDoesNotExist();
        return string.concat("ipfs://", cid);
    }

    /// @notice Returns the total minted supply for a token id.
    function totalSupply(uint256 id) external view returns (uint256) {
        return _totalSupply[id];
    }

    /// @notice Returns total likes for a token id.
    function likesOf(uint256 id) external view returns (uint256) {
        return _likes[id];
    }

    /// @notice Returns whether `user` has liked a token id.
    function hasLiked(address user, uint256 id) external view returns (bool) {
        return _hasLiked[id][user];
    }

    /// @notice Like a token. One like per user per token.
    function like(uint256 id) external {
        if (bytes(_tokenCid[id]).length == 0) revert TokenDoesNotExist();
        if (_hasLiked[id][msg.sender]) revert AlreadyLiked();
        _hasLiked[id][msg.sender] = true;
        unchecked {
            _likes[id] += 1;
        }
        emit Liked(msg.sender, id);
    }

    /// @notice Remove a like previously made by the caller.
    function unlike(uint256 id) external {
        if (bytes(_tokenCid[id]).length == 0) revert TokenDoesNotExist();
        if (!_hasLiked[id][msg.sender]) revert NotLiked();
        _hasLiked[id][msg.sender] = false;
        unchecked {
            _likes[id] -= 1;
        }
        emit Unliked(msg.sender, id);
    }
}


