"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const fs = __importStar(require("fs"));
// Set up a connection to the Solana blockchain
const connection = new web3_js_1.Connection('https://api.mainnet-beta.solana.com');
// Define GST and GMT token addresses
const GST_TOKEN_ADDRESS = '7oNHoLSnYE84fsVgfKmWFiW8V2T72PLqDN4F9SB7MnNu';
const GMT_TOKEN_ADDRESS = '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT';
// Function to get all tokens in a wallet and filter for GST and GMT
function getTokensInWallet(walletAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const publicKey = new web3_js_1.PublicKey(walletAddress);
            // Fetch the token accounts belonging to the wallet address
            const tokenAccounts = yield connection.getTokenAccountsByOwner(publicKey, {
                programId: new web3_js_1.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
            });
            const tokens = [];
            for (const accountInfo of tokenAccounts.value) {
                const accountData = accountInfo.account.data;
                const mintAddress = new web3_js_1.PublicKey(accountData.slice(0, 32)).toBase58();
                const amount = accountData.readBigUInt64LE(64).toString();
                // Only keep GST and GMT tokens
                if (mintAddress === GST_TOKEN_ADDRESS || mintAddress === GMT_TOKEN_ADDRESS) {
                    tokens.push({
                        address: accountInfo.pubkey.toBase58(),
                        mint: mintAddress,
                        amount: amount,
                    });
                }
            }
            // Write filtered tokens to output_log.txt
            fs.writeFileSync('output_log.txt', JSON.stringify(tokens, null, 2));
            return tokens;
        }
        catch (error) {
            // Write error to output_log.txt
            fs.writeFileSync('output_log.txt', `Error fetching tokens in wallet: ${error}`);
            return [];
        }
    });
}
// Clear output_log.txt before each run
fs.writeFileSync('output_log.txt', '');
// Example usage
const walletAddress = 'EBYYDbav6QgAM7JgYJcJgSKDgDvV8edgYJH5QmaAtZ6N';
getTokensInWallet(walletAddress);
