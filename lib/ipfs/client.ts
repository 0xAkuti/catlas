import { PinataSDK } from "pinata";

export function createPinataClient() {
  const jwt = process.env.PINATA_JWT;
  const gateway = process.env.PINATA_GATEWAY || ""; // e.g. mygateway.mypinata.cloud
  if (!jwt) console.warn("PINATA_JWT not set. IPFS uploads will fail.");
  return new PinataSDK({ pinataJwt: jwt || "", pinataGateway: gateway });
}


