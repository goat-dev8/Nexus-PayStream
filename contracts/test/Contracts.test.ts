import { expect } from "chai";
import { ethers } from "hardhat";
import { MerchantRegistry, InvoiceRegistry, TreasuryVaultUSDC } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MerchantRegistry", function () {
    let merchantRegistry: MerchantRegistry;
    let owner: SignerWithAddress;
    let merchant1: SignerWithAddress;
    let merchant2: SignerWithAddress;

    const testUsername = "testmerchant";
    const testStealthMeta = "0x04a5c5e5c5";

    beforeEach(async function () {
        [owner, merchant1, merchant2] = await ethers.getSigners();

        const MerchantRegistryFactory = await ethers.getContractFactory("MerchantRegistry");
        merchantRegistry = await MerchantRegistryFactory.deploy();
        await merchantRegistry.waitForDeployment();
    });

    describe("Registration", function () {
        it("Should register a new merchant", async function () {
            const tx = await merchantRegistry.connect(merchant1).registerMerchant(
                testUsername,
                merchant1.address,
                testStealthMeta
            );

            await expect(tx)
                .to.emit(merchantRegistry, "MerchantRegistered")
                .withArgs(1, testUsername, merchant1.address, testStealthMeta);

            const [merchantId, payoutAddress, stealthMeta] = await merchantRegistry.resolve(testUsername);
            expect(merchantId).to.equal(1);
            expect(payoutAddress).to.equal(merchant1.address);
            expect(stealthMeta).to.equal(testStealthMeta);
        });

        it("Should reject duplicate usernames", async function () {
            await merchantRegistry.connect(merchant1).registerMerchant(
                testUsername,
                merchant1.address,
                testStealthMeta
            );

            await expect(
                merchantRegistry.connect(merchant2).registerMerchant(
                    testUsername,
                    merchant2.address,
                    testStealthMeta
                )
            ).to.be.revertedWith("Username taken");
        });

        it("Should reject duplicate addresses", async function () {
            await merchantRegistry.connect(merchant1).registerMerchant(
                testUsername,
                merchant1.address,
                testStealthMeta
            );

            await expect(
                merchantRegistry.connect(merchant1).registerMerchant(
                    "another",
                    merchant1.address,
                    testStealthMeta
                )
            ).to.be.revertedWith("Already registered");
        });
    });

    describe("Update", function () {
        it("Should update merchant details", async function () {
            await merchantRegistry.connect(merchant1).registerMerchant(
                testUsername,
                merchant1.address,
                testStealthMeta
            );

            const newPayout = merchant2.address;
            const newStealthMeta = "0x05b6d6e6d6";

            await merchantRegistry.connect(merchant1).updateMerchant(newPayout, newStealthMeta);

            const [, payoutAddress, stealthMeta] = await merchantRegistry.resolve(testUsername);
            expect(payoutAddress).to.equal(newPayout);
            expect(stealthMeta).to.equal(newStealthMeta);
        });
    });

    describe("Resolution", function () {
        it("Should check username availability", async function () {
            expect(await merchantRegistry.isUsernameAvailable(testUsername)).to.be.true;

            await merchantRegistry.connect(merchant1).registerMerchant(
                testUsername,
                merchant1.address,
                testStealthMeta
            );

            expect(await merchantRegistry.isUsernameAvailable(testUsername)).to.be.false;
        });
    });
});

describe("InvoiceRegistry", function () {
    let merchantRegistry: MerchantRegistry;
    let invoiceRegistry: InvoiceRegistry;
    let owner: SignerWithAddress;
    let merchant: SignerWithAddress;
    let payer: SignerWithAddress;

    const USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
    const testEncryptedPointer = "QmTestIPFSHash123";

    beforeEach(async function () {
        [owner, merchant, payer] = await ethers.getSigners();

        const MerchantRegistryFactory = await ethers.getContractFactory("MerchantRegistry");
        merchantRegistry = await MerchantRegistryFactory.deploy();
        await merchantRegistry.waitForDeployment();

        const InvoiceRegistryFactory = await ethers.getContractFactory("InvoiceRegistry");
        invoiceRegistry = await InvoiceRegistryFactory.deploy(await merchantRegistry.getAddress());
        await invoiceRegistry.waitForDeployment();

        // Register merchant
        await merchantRegistry.connect(merchant).registerMerchant(
            "testmerchant",
            merchant.address,
            "0x04a5c5e5c5"
        );
    });

    describe("Invoice Creation", function () {
        it("Should create an invoice", async function () {
            const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
            const amount = ethers.parseUnits("100", 6); // 100 USDC

            const tx = await invoiceRegistry.createInvoice(
                1, // merchantId
                USDC,
                amount,
                expiry,
                testEncryptedPointer
            );

            await expect(tx)
                .to.emit(invoiceRegistry, "InvoiceCreated")
                .withArgs(1, 1, USDC, amount, expiry, testEncryptedPointer);

            const invoice = await invoiceRegistry.getInvoice(1);
            expect(invoice.merchantId).to.equal(1);
            expect(invoice.amount).to.equal(amount);
            expect(invoice.status).to.equal(0); // Pending
        });
    });

    describe("Invoice Payment", function () {
        it("Should mark invoice as paid", async function () {
            const expiry = Math.floor(Date.now() / 1000) + 3600;
            const amount = ethers.parseUnits("100", 6);

            await invoiceRegistry.createInvoice(1, USDC, amount, expiry, testEncryptedPointer);

            const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx-hash"));

            await invoiceRegistry.markPaid(1, txHash, payer.address, amount);

            const invoice = await invoiceRegistry.getInvoice(1);
            expect(invoice.status).to.equal(1); // Paid
            expect(invoice.payer).to.equal(payer.address);
            expect(invoice.paidAmount).to.equal(amount);
        });
    });
});
