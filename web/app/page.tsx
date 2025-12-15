export default function Home() {
  return (
    <div className="card">
      <h1>Family Memory Capsule</h1>
      <p>
        Encrypt family photos and videos with AES-256-GCM, store the ciphertext on IPFS (Pinata), and mint a time-locked NFT on
        Base Sepolia.
      </p>
      <div className="grid" style={{ marginTop: 20 }}>
        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <h3>Create a capsule</h3>
          <p>Upload a file, pick an unlock date, encrypt in your browser, and mint.</p>
          <a className="button" href="/create">Go to Create</a>
        </div>
        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <h3>Open a capsule</h3>
          <p>Enter a token ID to view once the unlock date arrives.</p>
          <a className="button" href="/open/1">Try /open/1</a>
        </div>
      </div>
      <div className="notice" style={{ marginTop: 20 }}>
        <strong>Key safety:</strong> The decryption key never leaves your browser. It is not stored on-chain or on IPFS. Save the
        base64 key after minting; losing it means the memory cannot be recovered.
      </div>
    </div>
  );
}
