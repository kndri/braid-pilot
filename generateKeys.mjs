import { generateKeyPair, exportPKCS8, exportJWK } from "jose";

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const jwk = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...jwk }] });

const singleLinePrivateKey = privateKey.trim().replace(/\n/g, ' ');

console.log("\nPaste these into the Convex dashboard:\n");
console.log(`JWT_PRIVATE_KEY="${singleLinePrivateKey}"`);
console.log(`JWKS='${jwks}'`);