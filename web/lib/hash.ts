const getSubtle = () => {
  const cryptoObj = (typeof window !== "undefined" ? window.crypto : (globalThis as any).crypto) as Crypto | undefined;
  if (!cryptoObj?.subtle) {
    throw new Error("WebCrypto not available in this context.");
  }
  return cryptoObj.subtle;
};

export const sha256Hex = async (buffer: ArrayBuffer): Promise<`0x${string}`> => {
  const subtle = getSubtle();
  const digest = await subtle.digest("SHA-256", buffer);
  const bytes = new Uint8Array(digest);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}`;
};
