"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";
import { waitForTransactionReceipt, readContract } from "wagmi/actions";
import { CONTRACT_ADDRESS, MEMORY_ABI } from "../../lib/contract";
import { generateKeyB64, encryptAesGcm } from "../../lib/crypto";
import { sha256Hex } from "../../lib/hash";
import { wagmiConfig } from "../../lib/wagmi";

const daysToSeconds = (days: number) => Math.max(0, Math.floor(days * 24 * 60 * 60));

export default function CreateMemory() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync, status: writeStatus } = useWriteContract();
  const primaryConnector = connectors[0];

  const [file, setFile] = useState<File | null>(null);
  const [openDays, setOpenDays] = useState(1);
  const [viewers, setViewers] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [keyB64, setKeyB64] = useState<string>("");
  const [encryptedCid, setEncryptedCid] = useState<string>("");
  const [metaCid, setMetaCid] = useState<string>("");

  const openAt = useMemo(() => Math.floor(Date.now() / 1000) + daysToSeconds(openDays), [openDays]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus("Select a file to upload.");
      return;
    }
    if (!isConnected) {
      setStatus("Connect a wallet first.");
      return;
    }
    if (!CONTRACT_ADDRESS) {
      setStatus("NEXT_PUBLIC_CONTRACT_ADDRESS is missing.");
      return;
    }

    try {
      setStatus("Encrypting file in-browser...");
      const key = generateKeyB64();
      setKeyB64(key);
      const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
      // Ensure a concrete ArrayBuffer copy (helps when target types get widened on Vercel).
      const bufferCopy = new Uint8Array(arrayBuffer.byteLength);
      bufferCopy.set(new Uint8Array(arrayBuffer));
      const { cipher, ivB64 } = await encryptAesGcm(key, bufferCopy.buffer);
      // Create a dedicated ArrayBuffer (avoids SharedArrayBuffer typing and keeps File/Blob happy)
      const cipherCopy = new Uint8Array(cipher.byteLength);
      cipherCopy.set(cipher);
      const cipherArrayBuffer: ArrayBuffer = cipherCopy.buffer;
      const mediaHash = await sha256Hex(cipherArrayBuffer);

      setStatus("Uploading encrypted file to Pinata...");
      const encryptedFile = new File([cipherArrayBuffer], `${file.name}.enc`, {
        type: file.type || "application/octet-stream",
      });
      const fileForm = new FormData();
      fileForm.append("file", encryptedFile);
      const pinRes = await fetch("/api/pinata/upload", { method: "POST", body: fileForm });
      const pinJson = await pinRes.json();
      if (!pinRes.ok) {
        throw new Error(pinJson?.detail || pinJson?.error || "Pinata upload failed");
      }
      const encryptedCid = pinJson.cid as string;
      setEncryptedCid(encryptedCid);

      setStatus("Publishing metadata to Pinata...");
      const metadata = {
        name: "Family Memory Capsule",
        description: "Encrypted memory, viewable after the open date by allowed addresses.",
        openAt,
        encryptedCid,
        ivB64,
        mediaHash,
        mimeType: file.type,
        originalName: file.name,
        createdAt: Date.now(),
      };
      const metaForm = new FormData();
      metaForm.append(
        "file",
        new File([JSON.stringify(metadata, null, 2)], "metadata.json", { type: "application/json" })
      );
      const metaRes = await fetch("/api/pinata/upload", { method: "POST", body: metaForm });
      const metaJson = await metaRes.json();
      if (!metaRes.ok) {
        throw new Error(metaJson?.detail || metaJson?.error || "Metadata upload failed");
      }
      const metaCid = metaJson.cid as string;
      setMetaCid(metaCid);

      const viewersList = viewers
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      setStatus("Sending mint transaction...");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: MEMORY_ABI,
        functionName: "mintMemory",
        args: [BigInt(openAt), encryptedCid, mediaHash, ivB64, metaCid, viewersList],
      });
      setTxHash(hash);

      setStatus("Waiting for confirmation...");
      await waitForTransactionReceipt(wagmiConfig, { hash });
      const latestId = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: MEMORY_ABI,
        functionName: "nextId",
      });
      setTokenId(Number(latestId));
      setStatus("Minted! Save your decryption key below.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setStatus(message);
    }
  };

  const connectButton = () => {
    if (isConnected) {
      return (
        <button className="button" type="button" onClick={() => disconnect()}>
          Disconnect ({address?.slice(0, 6)}...)
        </button>
      );
    }
    return (
      <button
        className="button"
        type="button"
        disabled={connectStatus === "pending" || !primaryConnector}
        onClick={() => primaryConnector && connect({ connector: primaryConnector })}
      >
        {connectStatus === "pending" ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  };

  return (
    <div className="card">
      <h2>Create a Memory Capsule</h2>
      <p>Encrypt a memory locally, push to IPFS via Pinata, and mint on Base Sepolia.</p>

      <div style={{ marginBottom: 12 }}>{connectButton()}</div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="file">Photo / Video</label>
        <input
          id="file"
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />

        <label htmlFor="openDays">Open after (days)</label>
        <input
          id="openDays"
          type="number"
          min={0}
          value={openDays}
          onChange={(e) => setOpenDays(Number(e.target.value))}
        />

        <label htmlFor="viewers">Allowlist addresses (comma separated)</label>
        <input
          id="viewers"
          type="text"
          placeholder="0xabc...,0xdef..."
          value={viewers}
          onChange={(e) => setViewers(e.target.value)}
        />

        <button className="button" type="submit" style={{ marginTop: 16 }} disabled={writeStatus === "pending"}>
          {writeStatus === "pending" ? "Minting..." : "Encrypt + Pinata + Mint"}
        </button>
      </form>

      {status && <div className="status">{status}</div>}

      {txHash && (
        <div className="notice">
          <div><strong>Tx Hash:</strong> {txHash}</div>
          <div>Track in your wallet or Base Sepolia explorer.</div>
        </div>
      )}

      {keyB64 && (
        <div className="notice" style={{ borderColor: "rgba(79,209,197,0.4)", color: "#bff3ec" }}>
          <strong>Decryption key (base64, save safely):</strong>
          <div style={{ wordBreak: "break-all" }}>{keyB64}</div>
          <small>This key is not stored on-chain or IPFS. Losing it means the file cannot be recovered.</small>
        </div>
      )}

      {(encryptedCid || metaCid) && (
        <div className="status">
          {encryptedCid && <div>Encrypted CID: {encryptedCid}</div>}
          {metaCid && <div>Metadata CID: {metaCid}</div>}
        </div>
      )}

      {tokenId && (
        <div className="notice" style={{ marginTop: 16 }}>
          <div><strong>Minted Token ID:</strong> {tokenId}</div>
          <a className="button" href={`/open/${tokenId}`} style={{ marginTop: 10, display: "inline-block" }}>
            Go to Open page
          </a>
        </div>
      )}
    </div>
  );
}
