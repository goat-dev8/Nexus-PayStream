import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🚀 Deploying NEXUS PayStream contracts to Polygon mainnet...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "MATIC\n");

    // Deploy MerchantRegistry
    console.log("📦 Deploying MerchantRegistry...");
    const MerchantRegistry = await ethers.getContractFactory("MerchantRegistry");
    const merchantRegistry = await MerchantRegistry.deploy();
    await merchantRegistry.waitForDeployment();
    const merchantRegistryAddress = await merchantRegistry.getAddress();
    console.log("✅ MerchantRegistry deployed to:", merchantRegistryAddress);

    // Deploy InvoiceRegistry
    console.log("\n📦 Deploying InvoiceRegistry...");
    const InvoiceRegistry = await ethers.getContractFactory("InvoiceRegistry");
    const invoiceRegistry = await InvoiceRegistry.deploy(merchantRegistryAddress);
    await invoiceRegistry.waitForDeployment();
    const invoiceRegistryAddress = await invoiceRegistry.getAddress();
    console.log("✅ InvoiceRegistry deployed to:", invoiceRegistryAddress);

    // Deploy TreasuryVaultUSDC
    console.log("\n📦 Deploying TreasuryVaultUSDC...");
    const TreasuryVaultUSDC = await ethers.getContractFactory("TreasuryVaultUSDC");
    const treasuryVault = await TreasuryVaultUSDC.deploy();
    await treasuryVault.waitForDeployment();
    const treasuryVaultAddress = await treasuryVault.getAddress();
    console.log("✅ TreasuryVaultUSDC deployed to:", treasuryVaultAddress);

    // Get deployment block
    const blockNumber = await ethers.provider.getBlockNumber();

    // Prepare deployment data
    const deploymentData = {
        chainId: 137,
        networkName: "polygon",
        deployedAt: new Date().toISOString(),
        startBlock: blockNumber,
        contracts: {
            MerchantRegistry: merchantRegistryAddress,
            InvoiceRegistry: invoiceRegistryAddress,
            TreasuryVaultUSDC: treasuryVaultAddress,
        },
        externalContracts: {
            USDC: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
            ERC5564Announcer: "0x55649E01B5Df198D18D95b5cc5051630cfD45564",
            AavePoolAddressesProvider: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
        },
    };

    // Write to web/src/config/deployments/polygon.json
    const deploymentsDir = path.join(__dirname, "../../web/src/config/deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const outputPath = path.join(deploymentsDir, "polygon.json");
    fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
    console.log("\n📄 Deployment data written to:", outputPath);

    console.log("\n🎉 Deployment complete!");
    console.log("\n--- Summary ---");
    console.log("MerchantRegistry:", merchantRegistryAddress);
    console.log("InvoiceRegistry:", invoiceRegistryAddress);
    console.log("TreasuryVaultUSDC:", treasuryVaultAddress);
    console.log("Start Block:", blockNumber);

    return deploymentData;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
