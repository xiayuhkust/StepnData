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
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const umi_bundle_defaults_1 = require("@metaplex-foundation/umi-bundle-defaults");
// Removed mplCore import as it doesn't exist in the package
const umi_1 = require("@metaplex-foundation/umi");
const umi_2 = require("@metaplex-foundation/umi");
const fs_1 = __importDefault(require("fs"));
//链接rpc失败
// Define the RPC connection and set up Umi
const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
const umi = (0, umi_bundle_defaults_1.createUmi)(RPC_ENDPOINT);
// Generate a new keypair signer for testing
const signer = (0, umi_1.generateSigner)(umi);
// Tell Umi to use the new signer
umi.use((0, umi_1.signerIdentity)(signer));
// Replace with the wallet address you want to read tokens from
const WALLET_ADDRESS = "7HBbnVF4XHztxkhK1hDqKMbtiDPYUuEmVvZpZKvAe3KE";
// Clear output log file
const LOG_FILE = 'output_log.txt';
fs_1.default.writeFileSync(LOG_FILE, '');
function getTokenMetadata() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Convert wallet address to PublicKey
            const walletPublicKey = (0, umi_2.publicKey)(WALLET_ADDRESS);
            // Fetch all digital assets owned by the given wallet
            const assets = yield (0, mpl_token_metadata_1.fetchAllDigitalAssetByOwner)(umi, walletPublicKey);
            // Check if assets are retrieved successfully
            if (assets.length === 0) {
                fs_1.default.appendFileSync(LOG_FILE, "No assets found for the given wallet address.\n");
                return;
            }
            // Iterate over each asset and display its metadata
            for (let asset of assets) {
                fs_1.default.appendFileSync(LOG_FILE, `Token Metadata: ${JSON.stringify(asset)}\n`);
            }
        }
        catch (error) {
            if (error instanceof TypeError && error.message.includes("fetch failed")) {
                fs_1.default.appendFileSync(LOG_FILE, "Error fetching token metadata: Fetch failed. Please check your internet connection or RPC endpoint.\n");
            }
            else if (error instanceof Error && error.message.includes("410")) {
                fs_1.default.appendFileSync(LOG_FILE, "Error fetching token metadata: The RPC call or parameters have been disabled. Please try a different RPC endpoint or contact support.\n");
            }
            else {
                fs_1.default.appendFileSync(LOG_FILE, `Error fetching token metadata: ${String(error)}\n`);
            }
        }
    });
}
// Run the function
getTokenMetadata();
