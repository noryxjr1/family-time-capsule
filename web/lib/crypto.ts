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

export const generateKeyB64 = () => {
  const cryptoObj = getCrypto();
  const bytes = new Uint8Array(32);
  cryptoObj.getRandomValues(bytes);
  return toBase64(bytes);
};

export const encryptAesGcm = async (
  keyB64: string,
  plain: ArrayBuffer | ArrayBufferLike
): Promise<{ cipher: Uint8Array; ivB64: string; ciphertext: string }> => {
  const cryptoObj = getCrypto();
  const iv = new Uint8Array(12);
  cryptoObj.getRandomValues(iv);
  const key = await importKey(keyB64, ["encrypt"]);
  const plainBuffer = toArrayBuffer(plain);
  const cipherBuffer = await cryptoObj.subtle.encrypt({ name: "AES-GCM", iv }, key, plainBuffer);
  const cipher = new Uint8Array(cipherBuffer as ArrayBuffer);
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
  const dataBuffer =
    typeof ciphertext === "string"
      ? toArrayBuffer(fromBase64(ciphertext))
      : toArrayBuffer(ciphertext as ArrayBuffer | ArrayBufferLike | ArrayBufferView);
  return subtle.decrypt({ name: "AES-GCM", iv }, key, dataBuffer);
};
