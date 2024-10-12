import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import * as fs from 'fs';

// Set up a connection to the Solana blockchain
const connection = new Connection('https://api.mainnet-beta.solana.com');

// Define the type for token information
interface TokenInfo {
  address: string;
  mint: string;
  amount: string;
}

// Function to get all tokens in a wallet
async function getTokensInWallet(walletAddress: string) {
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

    // Write tokens to output_log.txt
    fs.writeFileSync('output_log.txt', JSON.stringify(tokens, null, 2));
    return tokens;
  } catch (error) {
    // Write error to output_log.txt
    fs.writeFileSync('output_log.txt', `Error fetching tokens in wallet: ${error}`);
    return [];
  }
}

// Clear output_log.txt before each run
fs.writeFileSync('output_log.txt', '');

// Example usage
const walletAddress = '7HBbnVF4XHztxkhK1hDqKMbtiDPYUuEmVvZpZKvAe3KE';
getTokensInWallet(walletAddress);
