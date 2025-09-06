export function ipfsToHttp(cidOrUri: string): string {
  // Use only NEXT_PUBLIC_ var so server and client render the same URL
  const gw = process.env.NEXT_PUBLIC_PINATA_GATEWAY || ""; // e.g. mygateway.mypinata.cloud
  const cid = cidOrUri.startsWith("ipfs://") ? cidOrUri.replace("ipfs://", "") : cidOrUri;
  return gw ? `https://${gw}/ipfs/${cid}` : `https://ipfs.io/ipfs/${cid}`;
}


