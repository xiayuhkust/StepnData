import { fetchAllDigitalAssetByOwner } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// Removed mplCore import as it doesn't exist in the package
import { generateSigner, signerIdentity } from "@metaplex-foundation/umi";
import { publicKey, PublicKey } from '@metaplex-foundation/umi';
import fs from 'fs';
import fetch from 'node-fetch';
//链接rpc失败
// Define the RPC connection and set up Umi
const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
const umi = createUmi(RPC_ENDPOINT);

// Generate a new keypair signer for testing
const signer = generateSigner(umi);

// Tell Umi to use the new signer
umi.use(signerIdentity(signer));

// Replace with the wallet address you want to read tokens from
const WALLET_ADDRESS = "7HBbnVF4XHztxkhK1hDqKMbtiDPYUuEmVvZpZKvAe3KE";

// Clear output log file
const LOG_FILE = 'output_log.txt';
fs.writeFileSync(LOG_FILE, '');

async function getTokenMetadata() {
  try {
    // Convert wallet address to PublicKey
    const walletPublicKey: PublicKey = publicKey(WALLET_ADDRESS);

    // Fetch all digital assets owned by the given wallet
    const assets = await fetchAllDigitalAssetByOwner(umi, walletPublicKey);

    // Check if assets are retrieved successfully
    if (assets.length === 0) {
      fs.appendFileSync(LOG_FILE, "No assets found for the given wallet address.\n");
      return;
    }

    // Iterate over each asset and display its metadata
    for (let asset of assets) {
      fs.appendFileSync(LOG_FILE, `Token Metadata: ${JSON.stringify(asset)}\n`);
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch failed")) {
      fs.appendFileSync(LOG_FILE, "Error fetching token metadata: Fetch failed. Please check your internet connection or RPC endpoint.\n");
    } else if (error instanceof Error && error.message.includes("410")) {
      fs.appendFileSync(LOG_FILE, "Error fetching token metadata: The RPC call or parameters have been disabled. Please try a different RPC endpoint or contact support.\n");
    } else {
      fs.appendFileSync(LOG_FILE, `Error fetching token metadata: ${String(error)}\n`);
    }
  }
}

// Run the function
getTokenMetadata();