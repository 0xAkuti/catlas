export function ipfsToHttp(cidOrUri: string): string {
  const gw = process.env.PINATA_GATEWAY || ""; // e.g. mygateway.mypinata.cloud
  const cid = cidOrUri.startsWith("ipfs://") ? cidOrUri.replace("ipfs://", "") : cidOrUri;
  return gw ? `https://${gw}/ipfs/${cid}` : `https://ipfs.io/ipfs/${cid}`;
}


