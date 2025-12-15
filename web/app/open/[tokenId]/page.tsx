"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, MEMORY_ABI } from "../../../lib/contract";
import { decryptAesGcm } from "../../../lib/crypto";
import { sha256Hex } from "../../../lib/hash";

const gatewayUrl = (cid: string) => `https://gateway.pinata.cloud/ipfs/${cid}`;

type MemoryRecord = {
  openAt: bigint;
  encryptedCid: string;
  mediaHash: `0x${string}`;
  ivB64: string;
  metaCid: string;
  creator: `0x${string}`;
};

type MemoryMetadata = {
  name?: string;
  description?: string;
  openAt?: number;
  encryptedCid?: string;
  ivB64?: string;
  mediaHash?: string;
  mimeType?: string;
  originalName?: string;
};

export default function OpenMemory() {
  const params = useParams();
  const tokenIdParam = Array.isArray(params?.tokenId) ? params?.tokenId[0] : params?.tokenId;
  const tokenIdNumber = tokenIdParam ? Number(tokenIdParam) : NaN;

  const { address, isConnected } = useAccount();

  const recordResult = useReadContract({
    address: CONTRACT_ADDRESS || undefined,
    abi: MEMORY_ABI,
    functionName: "records",
    args: tokenIdNumber ? [BigInt(tokenIdNumber)] : undefined,
    query: { enabled: Boolean(CONTRACT_ADDRESS && tokenIdNumber) },
  });

  const canViewResult = useReadContract({
    address: CONTRACT_ADDRESS || undefined,
    abi: MEMORY_ABI,
    functionName: "canView",
    args: tokenIdNumber && address ? [BigInt(tokenIdNumber), address] : undefined,
    query: { enabled: Boolean(CONTRACT_ADDRESS && tokenIdNumber && address) },
  });

  const isOpenResult = useReadContract({
    address: CONTRACT_ADDRESS || undefined,
    abi: MEMORY_ABI,
    functionName: "isOpen",
    args: tokenIdNumber ? [BigInt(tokenIdNumber)] : undefined,
    query: { enabled: Boolean(CONTRACT_ADDRESS && tokenIdNumber) },
  });

  const record = useMemo<MemoryRecord | null>(() => {
    const data = recordResult.data as unknown as MemoryRecord | undefined;
    if (!data) return null;
    return data;
  }, [recordResult.data]);
  const tokenExists = record && record.creator !== "0x0000000000000000000000000000000000000000";

  const [metadata, setMetadata] = useState<MemoryMetadata | null>(null);
  const [metadataError, setMetadataError] = useState<string>("");
  const [keyInput, setKeyInput] = useState<string>("");
  const [decryptStatus, setDecryptStatus] = useState<string>("");
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<string>("");

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!record?.metaCid) return;
      try {
        setMetadataError("");
        const res = await fetch(gatewayUrl(record.metaCid));
        if (!res.ok) {
          throw new Error(`Metadata fetch failed: ${res.status}`);
        }
        const json = (await res.json()) as MemoryMetadata;
        setMetadata(json);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown metadata error";
        setMetadataError(msg);
      }
    };
    fetchMetadata();
  }, [record?.metaCid]);

  const handleDecrypt = async () => {
    if (!record) return;
    if (!keyInput.trim()) {
      setDecryptStatus("Enter the base64 decryption key");
      return;
    }
    try {
      setDecryptStatus("Fetching encrypted file from IPFS...");
      const res = await fetch(gatewayUrl(record.encryptedCid));
      if (!res.ok) {
        throw new Error(`Failed to download encrypted file: ${res.status}`);
      }
      const encryptedBuffer = await res.arrayBuffer();
      const computedHash = await sha256Hex(encryptedBuffer);
      if (record.mediaHash && record.mediaHash.toLowerCase() !== computedHash.toLowerCase()) {
        throw new Error("Ciphertext hash mismatch. File may be corrupted.");
      }

      setDecryptStatus("Decrypting...");
      const plainBuffer = await decryptAesGcm(keyInput.trim(), record.ivB64, encryptedBuffer);
      const mime = metadata?.mimeType || "application/octet-stream";
      const blob = new Blob([plainBuffer], { type: mime });
      const url = URL.createObjectURL(blob);
      setMediaUrl(url);
      setMediaType(mime);
      setDecryptStatus("Decrypted! Keep this page open to view/download.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown decrypt error";
      setDecryptStatus(message);
    }
  };

  const isAllowed = canViewResult.data ?? false;
  const isOpen = isOpenResult.data ?? false;
  const openDate = record ? new Date(Number(record.openAt) * 1000) : null;

  return (
    <div className="card">
      <h2>Open Capsule #{tokenIdParam}</h2>
      {!CONTRACT_ADDRESS && <div className="notice">Set NEXT_PUBLIC_CONTRACT_ADDRESS to continue.</div>}

      {recordResult.isError && <div className="notice">Failed to load record. Ensure the token exists.</div>}

      {record && tokenExists && (
        <div className="grid" style={{ marginTop: 12 }}>
          <div className="card">
            <div><strong>Encrypted CID:</strong> {record.encryptedCid}</div>
            <div><strong>Metadata CID:</strong> {record.metaCid}</div>
            {openDate && <div><strong>Opens:</strong> {openDate.toLocaleString()}</div>}
            <div><strong>Viewer:</strong> {isConnected ? address : "Connect a wallet"}</div>
            <div><strong>Allowed:</strong> {isAllowed ? "Yes" : "No"}</div>
            <div><strong>Opened:</strong> {isOpen ? "Yes" : "Not yet"}</div>
          </div>
          <div className="card">
            {metadata && (
              <div>
                <div><strong>Name:</strong> {metadata.name || "Family Memory Capsule"}</div>
                <div><strong>Type:</strong> {metadata.mimeType || "n/a"}</div>
                {metadata.originalName && <div><strong>Original:</strong> {metadata.originalName}</div>}
              </div>
            )}
            {metadataError && <div className="notice">{metadataError}</div>}
          </div>
        </div>
      )}

      {!tokenExists && (
        <div className="notice" style={{ marginTop: 16 }}>
          Token not found. Confirm the token ID and deployed contract address.
        </div>
      )}

      {!isOpen && openDate && tokenExists && (
        <div className="notice" style={{ marginTop: 16 }}>
          The capsule is locked until {openDate.toLocaleString()}.
        </div>
      )}

      {isOpen && !isAllowed && (
        <div className="notice" style={{ marginTop: 16 }}>
          Your address is not allowlisted to view this capsule.
        </div>
      )}

      {isOpen && isAllowed && (
        <div className="card" style={{ marginTop: 20 }}>
          <label htmlFor="key">Enter decryption key (base64)</label>
          <input
            id="key"
            type="text"
            placeholder="base64 key from mint step"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <button className="button" type="button" style={{ marginTop: 12 }} onClick={handleDecrypt}>
            Decrypt & View
          </button>
          {decryptStatus && <div className="status">{decryptStatus}</div>}
          {mediaUrl && (
            <div className="media-preview">
              {mediaType.startsWith("image") ? (
                <img src={mediaUrl} alt="Decrypted media" style={{ width: "100%" }} />
              ) : mediaType.startsWith("video") ? (
                <video controls style={{ width: "100%" }} src={mediaUrl} />
              ) : (
                <a className="button" href={mediaUrl} download>
                  Download file
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
