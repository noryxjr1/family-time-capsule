"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";
import { waitForTransactionReceipt, readContract } from "wagmi/actions";
import { CONTRACT_ADDRESS, MEMORY_ABI } from "../../lib/contract";
import { generateKeyB64, encryptAesGcm } from "../../lib/crypto";
import { sha256Hex } from "../../lib/hash";
import { wagmiConfig } from "../../lib/wagmi";

const toLocalDateTimeValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function CreateMemory() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync, status: writeStatus } = useWriteContract();
  const injectedConnector = connectors.find((c) => c.id === "injected");
  const wcConnector = connectors.find((c) => c.id === "walletConnect");
  const [isMobile, setIsMobile] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string }>({ name: "", type: "" });
  const [openDateTime, setOpenDateTime] = useState<string>(() =>
    toLocalDateTimeValue(new Date(Date.now() + 24 * 60 * 60 * 1000))
  );
  const [viewers, setViewers] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [keyB64, setKeyB64] = useState<string>("");
  const [encryptedCid, setEncryptedCid] = useState<string>("");
  const [metaCid, setMetaCid] = useState<string>("");

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent || "";
      setIsMobile(/Android|iPhone|iPad|iPod|Mobile/i.test(ua));
    }
  }, []);

  const openAt = useMemo(() => {
    if (!openDateTime) return null;
    const parsed = new Date(openDateTime);
    if (Number.isNaN(parsed.getTime())) return null;
    return Math.floor(parsed.getTime() / 1000);
  }, [openDateTime]);

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
    if (!openAt) {
      setStatus("Select a valid open date and time.");
      return;
    }
    if (openAt <= Math.floor(Date.now() / 1000)) {
      setStatus("Open date/time must be in the future.");
      return;
    }

    try {
      setStatus("Encrypting file in-browser...");
      const key = generateKeyB64();
      setKeyB64(key);
      const sourceBuffer: ArrayBuffer =
        fileBuffer ||
        (() => {
          throw new Error("File reference is unavailable. Please re-select the file.");
        })();
      // Ensure a concrete ArrayBuffer copy (helps when target types get widened on Vercel).
      const bufferCopy = new Uint8Array(sourceBuffer.byteLength);
      bufferCopy.set(new Uint8Array(sourceBuffer));
      const { cipher, ivB64 } = await encryptAesGcm(key, bufferCopy.buffer);
      // Create a dedicated ArrayBuffer (avoids SharedArrayBuffer typing and keeps File/Blob happy)
      const cipherCopy = new Uint8Array(cipher.byteLength);
      cipherCopy.set(cipher);
      const cipherArrayBuffer: ArrayBuffer = cipherCopy.buffer;
      const mediaHash = await sha256Hex(cipherArrayBuffer);

      setStatus("Uploading encrypted file to Pinata...");
      const encryptedFile = new File([cipherArrayBuffer], `${fileInfo.name || "memory"}.enc`, {
        type: fileInfo.type || "application/octet-stream",
      });
      const fileForm = new FormData();
      fileForm.append("file", encryptedFile);
      const pinRes = await fetch("/api/pinata/upload", { method: "POST", body: fileForm });
      const pinText = await pinRes.text();
      let pinJson: any;
      try {
        pinJson = JSON.parse(pinText);
      } catch {
        pinJson = { detail: pinText || "Pinata returned non-JSON response" };
      }
      if (!pinRes.ok) {
        const detail = pinJson?.detail || pinJson?.error || pinRes.statusText || "Pinata upload failed";
        throw new Error(detail);
      }
      const encryptedCid = (pinJson as any).cid as string;
      setEncryptedCid(encryptedCid);

      setStatus("Publishing metadata to Pinata...");
      const metadata = {
        name: "Family Memory Capsule",
        description: "Encrypted memory, viewable after the open date by allowed addresses.",
        openAt,
        encryptedCid,
        ivB64,
        mediaHash,
        mimeType: fileInfo.type,
        originalName: fileInfo.name,
        createdAt: Date.now(),
      };
      const metaForm = new FormData();
      metaForm.append(
        "file",
        new File([JSON.stringify(metadata, null, 2)], "metadata.json", { type: "application/json" })
      );
      const metaRes = await fetch("/api/pinata/upload", { method: "POST", body: metaForm });
      const metaText = await metaRes.text();
      let metaJson: any;
      try {
        metaJson = JSON.parse(metaText);
      } catch {
        metaJson = { detail: metaText || "Pinata returned non-JSON response" };
      }
      if (!metaRes.ok) {
        const detail = metaJson?.detail || metaJson?.error || metaRes.statusText || "Metadata upload failed";
        throw new Error(detail);
      }
      const metaCid = (metaJson as any).cid as string;
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
      <div className="cta-row" style={{ gap: 8 }}>
        <button
          className="button"
          type="button"
          disabled={connectStatus === "pending" || !injectedConnector}
          onClick={() => injectedConnector && connect({ connector: injectedConnector })}
        >
          {connectStatus === "pending" ? "Connecting..." : "Browser Wallet (Chrome)"}
        </button>
        {wcConnector && (
          <button
            className="button secondary"
            type="button"
            disabled={connectStatus === "pending"}
            onClick={() => connect({ connector: wcConnector })}
          >
            WalletConnect (Mobile/Base)
          </button>
        )}
      </div>
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
          onChange={async (e) => {
            const selected = e.target.files?.[0] || null;
            setFile(selected);
            setFileBuffer(null);
            if (!selected) return;
            try {
              const buf = await selected.arrayBuffer();
              setFileBuffer(buf);
              setFileInfo({ name: selected.name, type: selected.type });
            } catch {
              setStatus("Failed to read the selected file. Please choose it again.");
            }
          }}
          required
        />

        <label htmlFor="openDateTime">Open date & time</label>
        <input
          id="openDateTime"
          type="datetime-local"
          value={openDateTime}
          onChange={(e) => setOpenDateTime(e.target.value)}
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
