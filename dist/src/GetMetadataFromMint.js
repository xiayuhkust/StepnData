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
exports.fetchNftMetadata = fetchNftMetadata;
const umi_bundle_defaults_1 = require("@metaplex-foundation/umi-bundle-defaults");
const umi_1 = require("@metaplex-foundation/umi");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
// Clear output log file
const LOG_FILE = 'output_log.txt';
fs_1.default.writeFileSync(LOG_FILE, '');
function fetchNftMetadata(mintAddressStr) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create a UMI instance
            const umi = (0, umi_bundle_defaults_1.createUmi)("https://api.mainnet-beta.solana.com");
            // Use the mplTokenMetadata plugin
            umi.use((0, mpl_token_metadata_1.mplTokenMetadata)());
            // Generate a new keypair (you can replace this with your own keypair if needed)
            const keypair = (0, umi_1.generateSigner)(umi);
            umi.use((0, umi_1.signerIdentity)((0, umi_1.createSignerFromKeypair)(umi, keypair)));
            // The mint address of the NFT you want to fetch
            const mintAddress = (0, umi_1.publicKey)(mintAddressStr);
            console.log("Fetching NFT metadata...");
            fs_1.default.appendFileSync(LOG_FILE, "Fetching NFT metadata...\n");
            const asset = yield (0, mpl_token_metadata_1.fetchDigitalAsset)(umi, mintAddress);
            console.log("NFT Metadata:");
            fs_1.default.appendFileSync(LOG_FILE, `NFT Metadata:\n`);
            // If you want to access specific metadata fields:
            console.log("\nName:", asset.metadata.name);
            fs_1.default.appendFileSync(LOG_FILE, `Name: ${asset.metadata.name}\n`);
            console.log("Symbol:", asset.metadata.symbol);
            fs_1.default.appendFileSync(LOG_FILE, `Symbol: ${asset.metadata.symbol}\n`);
            console.log("URI:", asset.metadata.uri);
            fs_1.default.appendFileSync(LOG_FILE, `URI: ${asset.metadata.uri}\n`);
            // Fetch and log the JSON metadata
            if (asset.metadata.uri) {
                const response = yield (0, node_fetch_1.default)(asset.metadata.uri);
                if (response.ok) {
                    const jsonMetadata = yield response.json();
                    console.log("\nJSON Metadata:");
                    console.log(JSON.stringify(jsonMetadata, null, 2));
                    fs_1.default.appendFileSync(LOG_FILE, `JSON Metadata: ${JSON.stringify(jsonMetadata, null, 2)}\n`);
                    return jsonMetadata;
                }
                else {
                    console.error(`Failed to fetch JSON metadata from URI: ${asset.metadata.uri}`);
                    fs_1.default.appendFileSync(LOG_FILE, `Failed to fetch JSON metadata from URI: ${asset.metadata.uri}\n`);
                }
            }
        }
        catch (error) {
            console.error("Error:", error);
            fs_1.default.appendFileSync(LOG_FILE, `Error: ${error}\n`);
        }
        return null;
    });
}
// Example usage
// fetchNftMetadata("Ay1U9DWphDgc7hq58Yj1yHabt91zTzvV2YJbAWkPNbaK");
