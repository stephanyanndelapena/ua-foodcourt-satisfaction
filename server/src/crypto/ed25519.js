const crypto = require("crypto");

// Generate Ed25519 keypair (store as base64 DER)
function generateKeypair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const publicDer = publicKey.export({ type: "spki", format: "der" });
  const privateDer = privateKey.export({ type: "pkcs8", format: "der" });

  return {
    public_key_b64: publicDer.toString("base64"),
    private_key_b64: privateDer.toString("base64")
  };
}

// Stable stringify so signatures don't break due to key ordering
function stableStringify(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

function signPayload(private_key_b64, payloadString) {
  const privateKey = crypto.createPrivateKey({
    key: Buffer.from(private_key_b64, "base64"),
    format: "der",
    type: "pkcs8"
  });

  const sig = crypto.sign(null, Buffer.from(payloadString, "utf8"), privateKey);
  return sig.toString("base64");
}

function verifySignature(public_key_b64, payloadString, signature_b64) {
  const publicKey = crypto.createPublicKey({
    key: Buffer.from(public_key_b64, "base64"),
    format: "der",
    type: "spki"
  });

  return crypto.verify(
    null,
    Buffer.from(payloadString, "utf8"),
    publicKey,
    Buffer.from(signature_b64, "base64")
  );
}

module.exports = { generateKeypair, stableStringify, signPayload, verifySignature };