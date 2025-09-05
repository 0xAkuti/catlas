import { Web3Storage } from "web3.storage";

export function createWeb3StorageClient() {
  const token = process.env.WEB3_STORAGE_TOKEN;
  if (!token) {
    console.warn("WEB3_STORAGE_TOKEN not set. IPFS uploads will fail.");
  }
  return new Web3Storage({ token: token || "" });
}


