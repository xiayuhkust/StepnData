import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
  publicKey,
  PublicKey,
} from "@metaplex-foundation/umi";
import {
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import fs from 'fs';
import fetch from 'node-fetch';

// Clear output log file
const LOG_FILE = 'output_log.txt';
fs.writeFileSync(LOG_FILE, '');

export async function fetchNftMetadata(mintAddressStr: string) {
  try {
    // Create a UMI instance
    const umi = createUmi("https://api.mainnet-beta.solana.com");

    // Use the mplTokenMetadata plugin
    umi.use(mplTokenMetadata());

    // Generate a new keypair (you can replace this with your own keypair if needed)
    const keypair = generateSigner(umi);
    umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

    // The mint address of the NFT you want to fetch
    const mintAddress : PublicKey = publicKey(mintAddressStr);

    console.log("Fetching NFT metadata...");
    fs.appendFileSync(LOG_FILE, "Fetching NFT metadata...\n");
    const asset = await fetchDigitalAsset(umi, mintAddress);

    console.log("NFT Metadata:");
    fs.appendFileSync(LOG_FILE, `NFT Metadata:\n`);

    // If you want to access specific metadata fields:
    console.log("\nName:", asset.metadata.name);
    fs.appendFileSync(LOG_FILE, `Name: ${asset.metadata.name}\n`);
    console.log("Symbol:", asset.metadata.symbol);
    fs.appendFileSync(LOG_FILE, `Symbol: ${asset.metadata.symbol}\n`);
    console.log("URI:", asset.metadata.uri);
    fs.appendFileSync(LOG_FILE, `URI: ${asset.metadata.uri}\n`);

    // Fetch and log the JSON metadata
    if (asset.metadata.uri) {
      const response = await fetch(asset.metadata.uri);
      if (response.ok) {
        const jsonMetadata = await response.json();
        console.log("\nJSON Metadata:");
        console.log(JSON.stringify(jsonMetadata, null, 2));
        fs.appendFileSync(LOG_FILE, `JSON Metadata: ${JSON.stringify(jsonMetadata, null, 2)}\n`);
        return jsonMetadata;
      } else {
        console.error(`Failed to fetch JSON metadata from URI: ${asset.metadata.uri}`);
        fs.appendFileSync(LOG_FILE, `Failed to fetch JSON metadata from URI: ${asset.metadata.uri}\n`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
    fs.appendFileSync(LOG_FILE, `Error: ${error}\n`);
  }
  return null;
}

// Example usage
// fetchNftMetadata("Ay1U9DWphDgc7hq58Yj1yHabt91zTzvV2YJbAWkPNbaK");