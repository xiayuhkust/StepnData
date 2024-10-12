"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const fs_1 = __importDefault(require("fs"));
// Define the RPC connection and wallet address
const connection = new web3_js_1.Connection("https://api.mainnet-beta.solana.com");
// Replace with the wallet address you want to read tokens from
const WALLET_ADDRESS = "7HBbnVF4XHztxkhK1hDqKMbtiDPYUuEmVvZpZKvAe3KE";
// Clear output log file
const LOG_FILE = 'output_log.txt';
fs_1.default.writeFileSync(LOG_FILE, '');
// Function to get NFT metadata from user's wallet
function getTokenMetadata() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Convert wallet address to PublicKey
            const walletPublicKey = new web3_js_1.PublicKey(WALLET_ADDRESS);
            // Fetch all token accounts owned by the wallet
            const nftAccounts = yield connection.getParsedTokenAccountsByOwner(walletPublicKey, {
                programId: new web3_js_1.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
            });
            fs_1.default.appendFileSync(LOG_FILE, `Fetched ${nftAccounts.value.length} NFT accounts.
`);
            // Extract mint addresses from token accounts
            const mintAddresses = nftAccounts.value.map(account => account.account.data.parsed.info.mint).filter(mint => mint !== null);
            // Get metadata for each mint address
            const metadataAccounts = yield getMultipleTokenMetadata(mintAddresses);
            for (const metadata of metadataAccounts) {
                if (metadata) {
                    try {
                        fs_1.default.appendFileSync(LOG_FILE, `NFT Metadata: ${JSON.stringify(metadata)}
`);
                    }
                    catch (error) {
                        fs_1.default.appendFileSync(LOG_FILE, `Error processing metadata: ${error}
`);
                    }
                }
            }
        }
        catch (error) {
            fs_1.default.appendFileSync(LOG_FILE, `Error fetching NFT metadata: ${String(error)}
`);
        }
    });
}
// Function to get metadata for multiple tokens
function getMultipleTokenMetadata(mintAddresses) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        fs_1.default.appendFileSync(LOG_FILE, `Fetching multiple token metadata, input addresses: ${mintAddresses}
`);
        const accountInfos = yield connection.getMultipleAccountsInfo(mintAddresses.map(mint => new web3_js_1.PublicKey(mint)));
        const metadataList = [];
        for (let index = 0; index < accountInfos.length; index++) {
            const metadataAccount = accountInfos[index];
            if (metadataAccount && metadataAccount.data) {
                try {
                    const decodedData = Buffer.from(metadataAccount.data);
                    const metadataString = decodedData.toString('utf-8');
                    fs_1.default.appendFileSync(LOG_FILE, `Raw Metadata for mint ${mintAddresses[index]}: ${metadataString}
`);
                    let metadataJson;
                    try {
                        if (metadataString.trim().startsWith('{')) {
                            metadataJson = JSON.parse(metadataString);
                        }
                        else {
                            console.error(`Invalid JSON format for mint: ${mintAddresses[index]}, skipping.`);
                            continue;
                        }
                    }
                    catch (jsonError) {
                        console.error(`Failed to parse metadata JSON for mint: ${mintAddresses[index]}, error:`, jsonError);
                        continue;
                    }
                    const metadataUri = (_a = metadataJson.data) === null || _a === void 0 ? void 0 : _a.uri;
                    if (metadataUri) {
                        const response = yield fetch(metadataUri);
                        if (response.ok) {
                            try {
                                const metadata = yield response.json();
                                metadataList.push({
                                    mint: mintAddresses[index],
                                    name: metadata.name || "",
                                    uri: metadataUri
                                });
                            }
                            catch (fetchError) {
                                console.error(`Failed to parse fetched metadata JSON from URI: ${metadataUri}, error:`, fetchError);
                            }
                        }
                        else {
                            console.error(`Failed to fetch metadata from URI: ${metadataUri}, status: ${response.status}`);
                        }
                    }
                }
                catch (error) {
                    console.error(`Error processing token metadata for mint: ${mintAddresses[index]}, error:`, error);
                }
            }
        }
        return metadataList;
    });
}
// Run the function
getTokenMetadata();
