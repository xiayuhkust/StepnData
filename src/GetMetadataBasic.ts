import { Connection, PublicKey} from "@solana/web3.js";
import fs from 'fs';
//有乱码
// Define the RPC connection and wallet address
const connection = new Connection("https://api.mainnet-beta.solana.com");

// Replace with the wallet address you want to read tokens from
const WALLET_ADDRESS = "EBYYDbav6QgAM7JgYJcJgSKDgDvV8edgYJH5QmaAtZ6N";

// Clear output log file
const LOG_FILE = 'output_log.txt';
fs.writeFileSync(LOG_FILE, '');

// Define type for NFT metadata
interface NftInfo {
  mint: string;
  name: string;
  uri: string;
}

// Function to get NFT metadata from user's wallet
async function getTokenMetadata() {
  try {
    // Convert wallet address to PublicKey
    const walletPublicKey = new PublicKey(WALLET_ADDRESS);

    // Fetch all token accounts owned by the wallet
    const nftAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    });

    fs.appendFileSync(LOG_FILE, `Fetched ${nftAccounts.value.length} NFT accounts.
`);

    // Extract mint addresses from token accounts
    const mintAddresses = nftAccounts.value.map(account => account.account.data.parsed.info.mint).filter(mint => mint !== null);

    // Get metadata for each mint address
    const metadataAccounts = await getMultipleTokenMetadata(mintAddresses);

    for (const metadata of metadataAccounts) {
      if (metadata) {
        try {
          fs.appendFileSync(LOG_FILE, `NFT Metadata: ${JSON.stringify(metadata)}
`);
        } catch (error) {
          fs.appendFileSync(LOG_FILE, `Error processing metadata: ${error}
`);
        }
      }
    }
  } catch (error) {
    fs.appendFileSync(LOG_FILE, `Error fetching NFT metadata: ${String(error)}
`);
  }
}

// Function to get metadata for multiple tokens
async function getMultipleTokenMetadata(mintAddresses: string[]) {
  fs.appendFileSync(LOG_FILE, `Fetching multiple token metadata, input addresses: ${mintAddresses}
`);

  const accountInfos = await connection.getMultipleAccountsInfo(mintAddresses.map(mint => new PublicKey(mint)));
  const metadataList: NftInfo[] = [];
  for (let index = 0; index < accountInfos.length; index++) {
    const metadataAccount = accountInfos[index];
    if (metadataAccount && metadataAccount.data) {
      try {
        const decodedData = Buffer.from(metadataAccount.data);
        const metadataString = decodedData.toString('utf-8');
        fs.appendFileSync(LOG_FILE, `Raw Metadata for mint ${mintAddresses[index]}: ${metadataString}
`);
        let metadataJson;
        try {
          if (metadataString.trim().startsWith('{')) {
            metadataJson = JSON.parse(metadataString);
          } else {
            console.error(`Invalid JSON format for mint: ${mintAddresses[index]}, skipping.`);
            continue;
          }
        } catch (jsonError) {
          console.error(`Failed to parse metadata JSON for mint: ${mintAddresses[index]}, error:`, jsonError);
          continue;
        }
        const metadataUri = metadataJson.data?.uri;
        if (metadataUri) {
          const response = await fetch(metadataUri);
          if (response.ok) {
            try {
              const metadata = await response.json();
              metadataList.push({
                mint: mintAddresses[index],
                name: metadata.name || "",
                uri: metadataUri
              });
            } catch (fetchError) {
              console.error(`Failed to parse fetched metadata JSON from URI: ${metadataUri}, error:`, fetchError);
            }
          } else {
            console.error(`Failed to fetch metadata from URI: ${metadataUri}, status: ${response.status}`);
          }
        }
      } catch (error) {
        console.error(`Error processing token metadata for mint: ${mintAddresses[index]}, error:`, error);
      }
    }
  }
  return metadataList;
}

// Run the function
getTokenMetadata();

//node --no-warnings dist/src/GetMetadata_basic.js