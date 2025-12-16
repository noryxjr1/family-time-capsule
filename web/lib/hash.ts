const getSubtle = () => {
  const cryptoObj = (typeof window !== "undefined" ? window.crypto : (globalThis as any).crypto) as Crypto | undefined;
  if (!cryptoObj?.subtle) {
    throw new Error("WebCrypto not available in this context.");
  }
  return cryptoObj.subtle;
};

const toArrayBuffer = (input: ArrayBuffer | ArrayBufferLike | ArrayBufferView): ArrayBuffer => {
  // Always return a fresh ArrayBuffer to avoid SharedArrayBuffer typing issues.
  if (input instanceof ArrayBuffer) {
    return input.slice(0);
  }
  if ((input as ArrayBufferView).buffer) {
    const view = input as ArrayBufferView;
    const copy = new Uint8Array(view.byteLength);
    copy.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
    return copy.buffer;
  }
  const source = new Uint8Array(input as ArrayBufferLike);
  const copy = new Uint8Array(source.byteLength);
  copy.set(source);
  return copy.buffer;
};

export const sha256Hex = async (buffer: ArrayBuffer | ArrayBufferLike | ArrayBufferView): Promise<`0x${string}`> => {
  const subtle = getSubtle();
  const normalized = toArrayBuffer(buffer);
  const digest = await subtle.digest("SHA-256", normalized);
  const bytes = new Uint8Array(digest);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}`;
};
