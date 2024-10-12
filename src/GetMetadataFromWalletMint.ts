import { fetchNftMetadata } from './GetMetadataFromMint';
import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';

// Set up a connection to the Solana blockchain
const connection = new Connection('https://api.mainnet-beta.solana.com');

// Define the type for token information
interface TokenInfo {
  address: string;
  mint: string;
  amount: string;
}

// Define the type for metadata information
interface TokenMetadata {
  tokenInfo: TokenInfo;
  metadata: any;
}

// Function to get all tokens in a wallet and fetch their metadata
async function getTokensMetadataInWallet(walletAddress: string) {
  try {
    const publicKey = new PublicKey(walletAddress);

    // Fetch the token accounts belonging to the wallet address
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });

    const tokens: TokenInfo[] = [];

    for (const accountInfo of tokenAccounts.value) {
      const accountData = accountInfo.account.data;
      const mintAddress = new PublicKey(accountData.slice(0, 32)).toBase58();
      const amount = accountData.readBigUInt64LE(64).toString();

      tokens.push({
        address: accountInfo.pubkey.toBase58(),
        mint: mintAddress,
        amount: amount,
      });
    }

    // Fetch metadata for each token
    const metadataList: TokenMetadata[] = [];
    for (const token of tokens) {
      console.log(`Fetching metadata for mint address: ${token.mint}`);
      fs.appendFileSync('output_log.txt', `Fetching metadata for mint address: ${token.mint}\n`);
      const metadata = await fetchNftMetadata(token.mint);
      if (metadata) {
        metadataList.push({
          tokenInfo: token,
          metadata: metadata,
        });
      }
    }

    // Write metadata to output_log.txt
    fs.writeFileSync('output_log.txt', JSON.stringify(metadataList, null, 2));
    return metadataList;
  } catch (error) {
    // Write error to output_log.txt
    fs.writeFileSync('output_log.txt', `Error fetching tokens metadata in wallet: ${error}`);
    return [];
  }
}

// Clear output_log.txt before each run
fs.writeFileSync('output_log.txt', '');

// Example usage
const walletAddress = '7HBbnVF4XHztxkhK1hDqKMbtiDPYUuEmVvZpZKvAe3KE';
getTokensMetadataInWallet(walletAddress);