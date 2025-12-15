// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MemoryTimeCapsule is ERC721 {
    struct MemoryRecord {
        uint64 openAt;
        string encryptedCid;
        bytes32 mediaHash;
        string ivB64;
        string metaCid;
        address creator;
    }

    uint256 public nextId;
    mapping(uint256 => MemoryRecord) public records;
    mapping(uint256 => mapping(address => bool)) public allowed;

    event MemoryMinted(uint256 indexed tokenId, address indexed creator, uint64 openAt, string encryptedCid, string metaCid);
    event ViewerUpdated(uint256 indexed tokenId, address indexed viewer, bool isAllowed);

    constructor() ERC721("Family Memory Capsule", "FMC") {}

    function mintMemory(
        uint64 openAt,
        string calldata encryptedCid,
        bytes32 mediaHash,
        string calldata ivB64,
        string calldata metaCid,
        address[] calldata viewers
    ) external returns (uint256 tokenId) {
        tokenId = ++nextId;
        _safeMint(msg.sender, tokenId);

        records[tokenId] = MemoryRecord({
            openAt: openAt,
            encryptedCid: encryptedCid,
            mediaHash: mediaHash,
            ivB64: ivB64,
            metaCid: metaCid,
            creator: msg.sender
        });

        allowed[tokenId][msg.sender] = true;
        for (uint256 i = 0; i < viewers.length; i++) {
            allowed[tokenId][viewers[i]] = true;
        }

        emit MemoryMinted(tokenId, msg.sender, openAt, encryptedCid, metaCid);
    }

    function setViewer(uint256 tokenId, address viewer, bool isAllowed) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        allowed[tokenId][viewer] = isAllowed;
        emit ViewerUpdated(tokenId, viewer, isAllowed);
    }

    function canView(uint256 tokenId, address viewer) public view returns (bool) {
        address owner = _ownerOf(tokenId);
        if (owner == address(0)) {
            return false;
        }
        return owner == viewer || allowed[tokenId][viewer];
    }

    function isOpen(uint256 tokenId) public view returns (bool) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "Nonexistent token");
        return block.timestamp >= records[tokenId].openAt;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "Nonexistent token");
        return string(abi.encodePacked("ipfs://", records[tokenId].metaCid));
    }
}
