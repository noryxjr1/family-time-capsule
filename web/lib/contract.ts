import { Address } from "viem";

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "") as Address;
export const MEMORY_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "uint64", name: "openAt", type: "uint64" },
      { indexed: false, internalType: "string", name: "encryptedCid", type: "string" },
      { indexed: false, internalType: "string", name: "metaCid", type: "string" },
    ],
    name: "MemoryMinted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "address", name: "viewer", type: "address" },
      { indexed: false, internalType: "bool", name: "isAllowed", type: "bool" },
    ],
    name: "ViewerUpdated",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "viewer", type: "address" },
    ],
    name: "canView",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint64", name: "openAt", type: "uint64" },
      { internalType: "string", name: "encryptedCid", type: "string" },
      { internalType: "bytes32", name: "mediaHash", type: "bytes32" },
      { internalType: "string", name: "ivB64", type: "string" },
      { internalType: "string", name: "metaCid", type: "string" },
      { internalType: "address[]", name: "viewers", type: "address[]" },
    ],
    name: "mintMemory",
    outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "records",
    outputs: [
      { internalType: "uint64", name: "openAt", type: "uint64" },
      { internalType: "string", name: "encryptedCid", type: "string" },
      { internalType: "bytes32", name: "mediaHash", type: "bytes32" },
      { internalType: "string", name: "ivB64", type: "string" },
      { internalType: "string", name: "metaCid", type: "string" },
      { internalType: "address", name: "creator", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "viewer", type: "address" },
      { internalType: "bool", name: "isAllowed", type: "bool" },
    ],
    name: "setViewer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "isOpen",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];
