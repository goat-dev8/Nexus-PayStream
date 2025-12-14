import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🔍 Verifying contracts on PolygonScan...\n");

    // Read deployment data
    const deploymentsPath = path.join(__dirname, "../../web/src/config/deployments/polygon.json");

    if (!fs.existsSync(deploymentsPath)) {
        throw new Error("Deployment file not found. Please deploy first.");
    }

    const deploymentData = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
    const { contracts } = deploymentData;

    // Verify MerchantRegistry
    console.log("📦 Verifying MerchantRegistry...");
    try {
        await run("verify:verify", {
            address: contracts.MerchantRegistry,
            constructorArguments: [],
        });
        console.log("✅ MerchantRegistry verified");
    } catch (error: any) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ MerchantRegistry already verified");
        } else {
            console.error("❌ MerchantRegistry verification failed:", error.message);
        }
    }

    // Verify InvoiceRegistry
    console.log("\n📦 Verifying InvoiceRegistry...");
    try {
        await run("verify:verify", {
            address: contracts.InvoiceRegistry,
            constructorArguments: [contracts.MerchantRegistry],
        });
        console.log("✅ InvoiceRegistry verified");
    } catch (error: any) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ InvoiceRegistry already verified");
        } else {
            console.error("❌ InvoiceRegistry verification failed:", error.message);
        }
    }

    // Verify TreasuryVaultUSDC
    console.log("\n📦 Verifying TreasuryVaultUSDC...");
    try {
        await run("verify:verify", {
            address: contracts.TreasuryVaultUSDC,
            constructorArguments: [],
        });
        console.log("✅ TreasuryVaultUSDC verified");
    } catch (error: any) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ TreasuryVaultUSDC already verified");
        } else {
            console.error("❌ TreasuryVaultUSDC verification failed:", error.message);
        }
    }

    console.log("\n🎉 Verification complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
