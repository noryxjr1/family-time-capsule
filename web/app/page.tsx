export default function Home() {
  return (
    <div className="stacked">
      <div className="card">
        <div className="hero">
          <div>
            <div className="pill">Bright & family-first</div>
            <h1>Family Memory Capsule</h1>
            <p>
              Save the laughter, drawings, and first steps. Encrypt every photo or video, pin it safely, and gift it to your
              family as a time-locked keepsake on Base.
            </p>
            <div className="cta-row">
              <a className="button" href="/create">Create a capsule ↗</a>
              <a className="button secondary" href="/open">Browse capsules</a>
            </div>
            <div className="chips" style={{ marginTop: 14 }}>
              <div className="chip">Kid-friendly</div>
              <div className="chip">Private by default</div>
              <div className="chip">Family sharing</div>
            </div>
          </div>
          <div className="hero-illustration">
            <img src="/family-hero.png" alt="A cheerful family with kids celebrating memories" />
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card soft">
          <h3 className="section-title">Create together</h3>
          <p>Upload a photo or video, choose an unlock date, and mint the capsule. Perfect for birthdays, graduations, and first steps.</p>
          <div className="cta-row" style={{ marginTop: 10 }}>
            <a className="button" href="/create">Start a new capsule</a>
          </div>
        </div>
        <div className="card soft">
          <h3 className="section-title">Open with kids</h3>
          <p>Enter a token ID to reveal the moment when it’s time. Share the surprise with your children in a safe, private way.</p>
          <div className="cta-row" style={{ marginTop: 10 }}>
            <a className="button secondary" href="/open">Browse capsule list</a>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Why families love it</div>
        <div className="grid">
          <div className="card soft">
            <strong>Kid-focused moments</strong>
            <p>Celebrate first steps, school plays, and family trips. Keep everything bright, cheerful, and safe.</p>
          </div>
          <div className="card soft">
            <strong>Privacy built-in</strong>
            <p>End-to-end encryption in the browser. The decryption key never leaves your family.</p>
          </div>
          <div className="card soft">
            <strong>Time-locked joy</strong>
            <p>Pick an unlock date so kids can open their capsule on a birthday or milestone.</p>
          </div>
        </div>
        <div className="notice" style={{ marginTop: 16 }}>
          <strong>Key safety:</strong> The decryption key never leaves your browser. It is not stored on-chain or on IPFS. Save the
          base64 key after minting; losing it means the memory cannot be recovered.
        </div>
      </div>
    </div>
  );
}
