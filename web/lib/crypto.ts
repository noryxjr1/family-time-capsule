const getCrypto = () => {
  const cryptoObj = (typeof window !== "undefined" ? window.crypto : (globalThis as any).crypto) as Crypto | undefined;
  if (!cryptoObj || !cryptoObj.subtle || !cryptoObj.getRandomValues) {
    throw new Error("WebCrypto not available in this context. Use a modern browser.");
  }
  return cryptoObj;
};

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

const fromBase64 = (b64: string) => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const importKey = async (keyB64: string, usages: KeyUsage[]) => {
  const subtle = getCrypto().subtle;
  const raw = fromBase64(keyB64);
  return subtle.importKey("raw", raw, { name: "AES-GCM" }, false, usages);
};

export const generateKeyB64 = () => {
  const cryptoObj = getCrypto();
  const bytes = new Uint8Array(32);
  cryptoObj.getRandomValues(bytes);
  return toBase64(bytes);
};

export const encryptAesGcm = async (
  keyB64: string,
  plain: ArrayBuffer
): Promise<{ cipher: Uint8Array; ivB64: string; ciphertext: string }> => {
  const cryptoObj = getCrypto();
  const iv = new Uint8Array(12);
  cryptoObj.getRandomValues(iv);
  const key = await importKey(keyB64, ["encrypt"]);
  const cipherBuffer = await cryptoObj.subtle.encrypt({ name: "AES-GCM", iv }, key, plain);
  const cipher = new Uint8Array(cipherBuffer);
  return { cipher, ivB64: toBase64(iv), ciphertext: toBase64(cipher) };
};

export const decryptAesGcm = async (
  keyB64: string,
  ivB64: string,
  ciphertext: ArrayBuffer | Uint8Array | string
): Promise<ArrayBuffer> => {
  const subtle = getCrypto().subtle;
  const key = await importKey(keyB64, ["decrypt"]);
  const iv = fromBase64(ivB64);
  const data =
    typeof ciphertext === "string" ? fromBase64(ciphertext) : ciphertext instanceof ArrayBuffer ? new Uint8Array(ciphertext) : ciphertext;
  return subtle.decrypt({ name: "AES-GCM", iv }, key, data);
};
